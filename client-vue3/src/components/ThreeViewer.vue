<template>
  <!-- An STL or OBJ model, turned with the mouse or a finger (OrbitControls):
  drag to turn, wheel or pinch to zoom, right-drag or two fingers to move.
  As dodoc's ThreeDPreview.vue, and as adc-core draws its thumbs
  (server/mesh-thumb.js): same angle, same lights, same grey. Drawn only
  when the view changes. Loaded on demand, with three.js (MediaModal.vue) -->
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
  DirectionalLight,
  Group,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  Sphere,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

// as adc-core's mesh-thumb.js: the angle without a chosen view, the grey,
// the lights. They are given in view space there: here they follow the
// camera. Since three.js r155, intensities are physical: × π for the same
// result as before (dodoc's vue-3d-model)
const DEFAULT_ROTATION = { x: Math.PI / 18, y: -Math.PI / 10, z: 0 };
const BASE_COLOR = 0xdbdee3;
const AMBIENT = 0.42;
const LIGHTS = [
  { color: 0xffffff, intensity: 0.78, position: [1.2, 1.4, 1.1] },
  { color: 0xdde6ff, intensity: 0.28, position: [-1.1, 0.3, 0.5] },
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
      box.prepend(renderer.domElement);

      const scene = new Scene();
      const camera = new PerspectiveCamera(40, 1, 0.1, 1000);
      // the lights turn with the camera: the model is lit as on its thumb
      camera.add(new AmbientLight(0xffffff, AMBIENT * Math.PI));
      for (const { color, intensity, position } of LIGHTS) {
        const light = new DirectionalLight(color, intensity * Math.PI);
        light.position.set(...position);
        camera.add(light);
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
      this.resize();
    },

    async load() {
      let object;
      try {
        const loaded = await (
          this.type === "obj" ? new OBJLoader() : new STLLoader()
        ).loadAsync(this.src);
        if (this.is_unmounted) return;
        // flat shading, as the thumbs: OBJ materials replaced
        const material = new MeshLambertMaterial({
          color: BASE_COLOR,
          flatShading: true,
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

      // centred in a pivot, turned to its point of view: what getViewMatrix
      // reads back, with the camera
      const bounds = new Box3().setFromObject(object);
      object.position.sub(bounds.getCenter(new Vector3()));
      const pivot = new Group();
      pivot.add(object);
      const { x, y, z } = this.viewToRotation(this.view_matrix);
      pivot.rotation.set(x, y, z);
      this.three.scene.add(pivot);
      this.three.pivot = pivot;

      this.frame(bounds.getBoundingSphere(new Sphere()).radius);
      this.status = "loaded";
      this.$emit("loaded");
    },

    // the whole model in view, the camera in front of it, looking down -z
    frame(radius) {
      const { camera, controls } = this.three;
      const r = radius || 1;
      const fov = (camera.fov * Math.PI) / 180;
      const distance = (r / Math.sin(fov / 2)) * 1.05;
      camera.near = distance / 100;
      camera.far = distance * 100;
      camera.position.set(0, 0, distance);
      camera.updateProjectionMatrix();
      controls.target.set(0, 0, 0);
      controls.minDistance = r * 0.2;
      controls.maxDistance = distance * 10;
      controls.update();
      this.render();
    },

    resize() {
      const { renderer, camera } = this.three;
      const { clientWidth: width, clientHeight: height } = this.$refs.box;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      this.render();
    },

    render() {
      const { renderer, scene, camera } = this.three;
      renderer?.render(scene, camera);
    },

    // as dodoc: the saved view back to a three.js "XYZ" euler of the model,
    // the camera looking down -z
    viewToRotation(r) {
      if (!Array.isArray(r) || r.length !== 9) return DEFAULT_ROTATION;
      const y = Math.asin(Math.max(-1, Math.min(1, r[2])));
      if (Math.abs(r[2]) < 0.9999999)
        return { x: Math.atan2(-r[5], r[8]), y, z: Math.atan2(-r[1], r[0]) };
      return { x: Math.atan2(r[7], r[4]), y, z: 0 };
    },

    // the rotation from the model to the camera, row-major 3×3, as
    // adc-core's mesh-thumb.js draws thumbs from ($thumb_view). null until
    // loaded
    getViewMatrix() {
      const { camera, pivot } = this.three;
      if (!camera || !pivot) return null;
      camera.updateMatrixWorld();
      pivot.updateMatrixWorld();
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
      return [0, 1, 2].flatMap((i) => cols.map((col) => +col[i].toFixed(5)));
    },
  },
};
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
