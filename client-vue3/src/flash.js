// A media's tile, as its window opens and closes (CahierView.vue): it grows
// a little on the click, as if it became the window, and once the window
// closes, it comes back from a little larger to its size. After ← or →, the
// tile of the last media seen does so once scrolled to.
// Data attributes rather than classes: Vue rewrites a tile's classes when
// it changes (seen, playing). Styles in assets/main.scss.

const tileOf = (path_to_meta) =>
  path_to_meta
    ? document.querySelector(`[data-path="${CSS.escape(path_to_meta)}"]`)
    : null;

export function ungrow() {
  document
    .querySelectorAll("[data-grown]")
    .forEach((el) => el.removeAttribute("data-grown"));
}

// clicked: grows, until its window closes
export function growTile(path_to_meta) {
  ungrow();
  tileOf(path_to_meta)?.setAttribute("data-grown", "");
}

// its window closed: back to its size. as: "browsed", another media than
// the one clicked, being scrolled to (MediaTimeline, MediaGrid); "seen",
// marked seen by the top bar's count (CahierView.vue), more gently
export function closeTile(el_or_path, { as = "" } = {}) {
  ungrow();
  const el = typeof el_or_path === "string" ? tileOf(el_or_path) : el_or_path;
  if (!el) return;
  // restarted, if still playing
  clearTimeout(el._closed_timeout);
  el.removeAttribute("data-closed");
  void el.offsetWidth;
  el.setAttribute("data-closed", as);
  // once the animation is over (1.35s at most)
  el._closed_timeout = setTimeout(
    () => el.removeAttribute("data-closed"),
    2000
  );
}
