// The typeface on trial, chosen from the home page's footer (AppFooter.vue).
// main.scss switches to it on <html data-font="victor">. The choice is only
// kept in this browser, and applies to every page.

const STORAGE_KEY = "font";

export function getFont() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "victor" ? "victor" : "";
  } catch {
    return "";
  }
}

export function setFont(font) {
  if (font) document.documentElement.dataset.font = font;
  else delete document.documentElement.dataset.font;
  try {
    if (font) localStorage.setItem(STORAGE_KEY, font);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // private browsing: the choice lasts until the page is reloaded
  }
}
