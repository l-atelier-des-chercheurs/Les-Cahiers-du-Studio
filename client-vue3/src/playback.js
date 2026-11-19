// The media playing in its tile (MediaTile.vue): one at a time. Starting
// another stops it; opening a media's window stops it (MediaModal.vue).
// Each holds its own stop function.
let current = null;

export function play(stop) {
  if (current && current !== stop) current();
  current = stop;
}

// once it has stopped: forgotten, unless another took its place
export function release(stop) {
  if (current === stop) current = null;
}

export function stopAll() {
  current?.();
}
