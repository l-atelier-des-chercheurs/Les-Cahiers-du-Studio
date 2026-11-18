import { watch } from "vue";
import { useUnseenStore } from "@/stores/unseen";

// v-seen="media.$path": while the media is unseen (stores/unseen.js), it
// becomes seen when hovered or tapped, or after SEEN_AFTER_MS mostly on
// screen. Meanwhile the element has the class "is--seeing", to show the
// countdown (its outline fades out). The countdown starts over if the
// element leaves the screen, and waits while the tab is hidden or a window
// is open over the page (the import window, while medias arrive behind it).

const SEEN_AFTER_MS = 2000;
// "mostly on screen": this share of the element
const VISIBLE_RATIO = 0.5;

const pageIsCovered = () =>
  document.hidden || !!document.querySelector("dialog[open]");

function track(el, path_to_meta) {
  const store = useUnseenStore();
  let timer;

  const seen = () => store.markSeen(path_to_meta);
  const start = () => {
    el.classList.add("is--seeing");
    timer = setTimeout(() => {
      timer = undefined;
      if (!pageIsCovered()) return seen();
      // try again once the page is uncovered
      el.classList.remove("is--seeing");
      start();
    }, SEEN_AFTER_MS);
  };
  const stop = () => {
    clearTimeout(timer);
    timer = undefined;
    el.classList.remove("is--seeing");
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!timer) start();
      } else stop();
    },
    { threshold: VISIBLE_RATIO }
  );
  observer.observe(el);
  el.addEventListener("pointerenter", seen);
  el.addEventListener("click", seen);

  return () => {
    stop();
    observer.disconnect();
    el.removeEventListener("pointerenter", seen);
    el.removeEventListener("click", seen);
  };
}

function bind(el, path_to_meta) {
  const store = useUnseenStore();
  // the media may become unseen after its element shows up: its creation
  // and the server's fileCreated event come in either order
  el._seen_stop_watch = watch(
    () => store.isUnseen(path_to_meta),
    (unseen) => {
      el._seen_untrack?.();
      el._seen_untrack = unseen ? track(el, path_to_meta) : undefined;
    },
    { immediate: true }
  );
}

function unbind(el) {
  el._seen_stop_watch?.();
  el._seen_untrack?.();
  el._seen_untrack = undefined;
}

export const vSeen = {
  mounted(el, { value }) {
    bind(el, value);
  },
  updated(el, { value, oldValue }) {
    if (value === oldValue) return;
    unbind(el);
    bind(el, value);
  },
  unmounted(el) {
    unbind(el);
  },
};
