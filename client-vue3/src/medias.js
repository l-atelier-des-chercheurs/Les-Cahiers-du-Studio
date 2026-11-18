import { i18n } from "@/i18n";

// Dates of a cahier's medias, shared by its views (grid, timeline).

// where a media sits in time: its date on the timeline, or when it was made
export function dateOf(media) {
  return media.date_timeline || media.$date_created;
}

export function timeOf(media) {
  const time = +new Date(dateOf(media));
  return isNaN(time) ? NaN : time;
}

// oldest first, as on the timeline; undated medias last
export function sortByDate(medias) {
  return [...medias].sort((a, b) => {
    const ta = timeOf(a);
    const tb = timeOf(b);
    if (isNaN(ta)) return isNaN(tb) ? 0 : 1;
    if (isNaN(tb)) return -1;
    return ta - tb;
  });
}

// the local day: "2026-11-18"
export function dayKey(date) {
  const d = new Date(date);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "mardi 18 novembre 2026"
export function formatDay(date) {
  const d = new Date(date);
  if (isNaN(d)) return i18n.global.t("no_date");
  return d.toLocaleDateString(i18n.global.locale.value, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// "14:32"
export function formatTime(date) {
  const d = new Date(date);
  if (isNaN(d)) return "";
  return d.toLocaleTimeString(i18n.global.locale.value, { timeStyle: "short" });
}
