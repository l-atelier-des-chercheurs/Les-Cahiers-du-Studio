<template>
  <!-- An STL or OBJ model, turned with the mouse or a finger (OrbitControls):
  drag to turn, wheel or pinch to zoom, right-drag or two fingers to move.
  As dodoc's ThreeDPreview.vue, drawn exactly as adc-core draws its thumbs
  (server/mesh-thumb.js): it opens as its thumb was, and a view saved
  here makes the thumb seen. Drawn only when the view changes. Loaded on
  demand, with three.js (MediaModal.vue) -->
  <div ref="box" class="m_three">
    <p v-if="status !== 'loaded'" class="m_three--status">
      {{ $t(status === "error" ? "failed_to_load_3d" : "loading_3d") }}
    </p>
  </div>
</template>

<script>
import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  LinearSRGBColorSpace,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  OrthographicCamera,
  Scene,
  Sphere,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

// Drawn as adc-core draws the thumbs (server/mesh-thumb.js), for the model
// to show as on its thumb, and a view saved here to make the thumb seen:
// - no perspective, the model fitted to its bounds in view space, centred,
//   its larger side at 86% of the square the thumb is shown in
// - the same angle without a saved view, the same grey and lights, the
//   lights in view space (they turn with the camera)
// - flat faces lit from the camera's side, both sides drawn
// - the light computed on the colours as given, not in linear space: no
//   colour management, here as there. Since three.js r155, intensities
//   are physical: × π for the same result
const DEFAULT_ROTATION = { x: Math.PI / 18, y: -Math.PI / 10, z: 0 };
const FILL = 0.86;
const BASE_COLOR = [0.86, 0.87, 0.89];
const AMBIENT = 0.42;
const LIGHTS = [
  { color: [1, 1, 1], intensity: 0.78, position: [1.2, 1.4, 1.1] },
  {
    color: [0xdd / 255, 0xe6 / 255, 1],
    intensity: 0.28,
    position: [-1.1, 0.3, 0.5],
  },
];

export default {
  props: {
    src: { type: String, required: true },
    // "stl" or "obj"
    type: { type: String, required: true },
    // its saved point of view ($thumb_view), see getViewMatrix
    view_matrix: { type: Array, default: null },
  },
  emits: ["loaded", "error"],
  data() {
    return {
      status: "loading",
    };
  },
  mounted() {
    // three.js objects: kept out of Vue's reactivity
    this.three = {};
    this.setup();
    this.load();
  },
  beforeUnmount() {
    this.is_unmounted = true;
    const { renderer, controls, observer, scene } = this.three;
    observer?.disconnect();
    controls?.dispose();
    scene?.traverse((object) => {
      object.geometry?.dispose();
      [object.material].flat().forEach((m) => m?.dispose());
    });
    renderer?.dispose();
    renderer?.domElement.remove();
  },
  methods: {
    setup() {
      const box = this.$refs.box;
      const renderer = new WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = LinearSRGBColorSpace;
      box.prepend(renderer.domElement);

      const scene = new Scene();
      const camera = new OrthographicCamera();
      camera.add(new AmbientLight(rgb([1, 1, 1]), AMBIENT * Math.PI));
      for (const { color, intensity, position } of LIGHTS) {
        const light = new DirectionalLight(rgb(color), intensity * Math.PI);
        // lit from position towards the camera's axis: both in view space
        light.position.set(...position);
        light.target = new Object3D();
        camera.add(light, light.target);
      }
      scene.add(camera);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.addEventListener("change", this.render);

      const observer = new ResizeObserver(this.resize);
      observer.observe(box);

      Object.assign(this.three, {
        renderer,
        scene,
        camera,
        controls,
        observer,
      });
    },

    async load() {
      let object;
      try {
        const loaded = await (
          this.type === "obj" ? new OBJLoader() : new STLLoader()
        ).loadAsync(this.src);
        if (this.is_unmounted) return;
        // OBJ materials replaced
        const material = new MeshLambertMaterial({
          color: rgb(BASE_COLOR),
          flatShading: true,
          side: DoubleSide,
        });
        if (this.type === "obj") {
          object = loaded;
          object.traverse((child) => {
            if (child.isMesh) {
              [child.material].flat().forEach((m) => m?.dispose());
              child.material = material;
            }
          });
        } else object = new Mesh(loaded, material);
      } catch (err) {
        if (this.is_unmounted) return;
        this.status = "error";
        this.$emit("error", err);
        return;
      }

      // in a pivot turned to its point of view: what getViewMatrix reads
      // back, with the camera
      const model_bounds = new Box3().setFromObject(object, true);
      object.position.sub(model_bounds.getCenter(new Vector3()));
      const pivot = new Group();
      pivot.add(object);
      const { x, y, z } = this.viewToRotation(this.view_matrix);
      pivot.rotation.set(x, y, z);
      pivot.updateMatrixWorld(true);
      this.three.scene.add(pivot);
      this.three.pivot = pivot;

      // the camera looks down -z: world space is view space. As the thumb:
      // centred on the turned model's bounds, fitted to their width and
      // height
      const bounds = new Box3().setFromObject(pivot, true);
      const center = bounds.getCenter(new Vector3());
      const size = bounds.getSize(new Vector3());
      const radius = model_bounds.getBoundingSphere(new Sphere()).radius || 1;
      this.three.extent = Math.max(size.x, size.y) / 2 || radius;

      // a saved framing: zoomed, the point at the centre moved (as
      // adc-core's mesh-thumb.js)
      const [zoom, pan_x, pan_y] =
        this.view_matrix?.length === 12 ? this.view_matrix.slice(9) : [1, 0, 0];
      const target = center
        .clone()
        .add(new Vector3(pan_x, pan_y, 0).multiplyScalar(this.three.extent));

      const { camera, controls } = this.three;
      // the model within 2 radii of its centre, whichever the turn
      camera.position.set(target.x, target.y, center.z + radius * 3);
      camera.near = 0;
      camera.far = radius * 6;
      camera.zoom = zoom > 0 ? zoom : 1;
      controls.target.copy(target);
      controls.minZoom = 0.2;
      controls.maxZoom = 20;
      controls.update();

      this.resize();
      this.status = "loaded";
      this.$emit("loaded");
    },

    // the frustum: a pixel worth as much as on the thumb, shown whole in
    // this box (object-fit: contain), its square as large as the box's
    // smaller side
    resize() {
      const { renderer, camera, extent } = this.three;
      const { clientWidth: width, clientHeight: height } = this.$refs.box;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      if (extent) {
        const per_pixel = extent / ((Math.min(width, height) * FILL) / 2);
        camera.left = (-width / 2) * per_pixel;
        camera.right = (width / 2) * per_pixel;
        camera.top = (height / 2) * per_pixel;
        camera.bottom = (-height / 2) * per_pixel;
        camera.updateProjectionMatrix();
      }
      this.render();
    },

    render() {
      const { renderer, scene, camera } = this.three;
      renderer?.render(scene, camera);
    },

    // as dodoc: the saved view back to a three.js "XYZ" euler of the model,
    // the camera looking down -z
    viewToRotation(r) {
      if (!Array.isArray(r) || (r.length !== 9 && r.length !== 12))
        return DEFAULT_ROTATION;
      const y = Math.asin(Math.max(-1, Math.min(1, r[2])));
      if (Math.abs(r[2]) < 0.9999999)
        return { x: Math.atan2(-r[5], r[8]), y, z: Math.atan2(-r[1], r[0]) };
      return { x: Math.atan2(r[7], r[4]), y, z: 0 };
    },

    // the model's bounds seen from the camera, in view space
    viewBounds() {
      const { camera, pivot } = this.three;
      const bounds = new Box3();
      const point = new Vector3();
      const to_view = new Matrix4();
      pivot.traverse((child) => {
        const position = child.isMesh && child.geometry.attributes.position;
        if (!position) return;
        to_view.multiplyMatrices(camera.matrixWorldInverse, child.matrixWorld);
        for (let i = 0; i < position.count; i++)
          bounds.expandByPoint(
            point.fromBufferAttribute(position, i).applyMatrix4(to_view)
          );
      });
      return bounds;
    },

    // what adc-core's mesh-thumb.js draws thumbs from ($thumb_view): the
    // rotation from the model to the camera, row-major 3×3, then the
    // framing: zoom (1: fitted), and the point seen at the centre, from the
    // centre of the bounds, in half-extents. null until loaded
    getViewMatrix() {
      const { camera, controls, pivot, extent } = this.three;
      if (!camera || !pivot) return null;
      camera.updateMatrixWorld();
      pivot.updateMatrixWorld(true);
      const m = new Matrix4().multiplyMatrices(
        camera.matrixWorldInverse,
        pivot.matrixWorld
      ).elements;
      // column-major: each column without its scale
      const cols = [0, 1, 2].map((j) => {
        const col = [m[j * 4], m[j * 4 + 1], m[j * 4 + 2]];
        const length = Math.hypot(...col) || 1;
        return col.map((v) => v / length);
      });
      const rotation = [0, 1, 2].flatMap((i) =>
        cols.map((col) => +col[i].toFixed(5))
      );

      // there, the model is fitted to its bounds from this side: the zoom
      // here, relative to the fit when it opened, is made relative to that
      const bounds = this.viewBounds();
      const center = bounds.getCenter(new Vector3());
      const size = bounds.getSize(new Vector3());
      const view_extent = Math.max(size.x, size.y) / 2 || extent;
      const zoom = (camera.zoom * view_extent) / extent;
      const target = controls.target
        .clone()
        .applyMatrix4(camera.matrixWorldInverse);
      const pan_x = (target.x - center.x) / view_extent;
      const pan_y = (target.y - center.y) / view_extent;
      return [
        ...rotation,
        +zoom.toFixed(4),
        +pan_x.toFixed(4),
        +pan_y.toFixed(4),
      ];
    },
  },
};

// a colour as given, without conversion (no colour management, as adc-core)
function rgb([r, g, b]) {
  return new Color().setRGB(r, g, b, LinearSRGBColorSpace);
}
</script>

<style lang="scss" scoped>
.m_three {
  position: relative;
  width: 100%;
  height: 100%;

  :deep(canvas) {
    display: block;
    width: 100%;
    height: 100%;
    cursor: grab;
    // the controls take the touches: no scrolling, no zoom of the page
    touch-action: none;

    &:active {
      cursor: grabbing;
    }
  }
}

.m_three--status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  color: var(--c-noir);
  pointer-events: none;
}
</style>
