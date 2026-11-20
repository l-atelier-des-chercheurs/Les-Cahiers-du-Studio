// The media playing in its tile (MediaTile.vue): one at a time. Starting
// another stops it; opening a media's window stops it (MediaModal.vue),
// which carries on from where it was if it is that media.
// Each holds its own stop function, and where it is: { path, time }.
let current = null;

export function play(stop, where = () => null) {
  if (current && current.stop !== stop) current.stop();
  current = { stop, where };
}

// once it has stopped: forgotten, unless another took its place
export function release(stop) {
  if (current?.stop === stop) current = null;
}

// stops whatever plays; returns where it was, { path, time }, or null
export function stopAll() {
  if (!current) return null;
  const { stop, where } = current;
  const was = where();
  stop();
  return was;
}
