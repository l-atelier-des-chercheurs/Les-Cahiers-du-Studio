import DOMPurify from "dompurify";
import { marked } from "marked";

// A text media's Markdown, as HTML to show. Written by the cahier's
// contributors, read by every visitor: the HTML is sanitised (no scripts,
// no javascript: links). Links open in a new tab.
marked.use({ gfm: true, breaks: true });

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("href")) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function renderMarkdown(text) {
  return DOMPurify.sanitize(marked.parse(String(text ?? "")));
}
