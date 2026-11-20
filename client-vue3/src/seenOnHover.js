import { useUnseenStore } from "@/stores/unseen";

// v-seen-on-hover="media.$path": a media not seen yet (stores/unseen.js)
// is seen once the mouse stays over it for a while. With a mouse only:
// on touch screens, a tap opens it, which marks it seen too (MediaModal.vue).

const DELAY_MS = 1000;

function clear(el) {
  clearTimeout(el._seen_timeout);
  el._seen_timeout = null;
}

export const vSeenOnHover = {
  mounted(el, binding) {
    el._seen_path = binding.value;
    el._seen_enter = (event) => {
      if (event.pointerType !== "mouse") return;
      const store = useUnseenStore();
      if (!store.isUnseen(el._seen_path)) return;
      clear(el);
      el._seen_timeout = setTimeout(() => {
        el._seen_timeout = null;
        store.markSeen(el._seen_path);
      }, DELAY_MS);
    };
    el._seen_leave = () => clear(el);
    el.addEventListener("pointerenter", el._seen_enter);
    el.addEventListener("pointerleave", el._seen_leave);
  },
  updated(el, binding) {
    if (binding.value !== el._seen_path) clear(el);
    el._seen_path = binding.value;
  },
  beforeUnmount(el) {
    clear(el);
    el.removeEventListener("pointerenter", el._seen_enter);
    el.removeEventListener("pointerleave", el._seen_leave);
  },
};
