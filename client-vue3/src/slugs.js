// A cahier is at the root of the site, /<slug> (router.js). What else can
// answer a top-level URL, and why it doesn't get in the way:
//
// - adc-core's routes start with "_" (/_api2, /_client, /_perf) or have a
//   dot (/robots.txt, /site.webmanifest), and the app's own pages, if any,
//   must start with "_" too: slugs never have "_" nor "." (slugg turns them
//   into "-"), so no cahier can ever take these URLs, nor be shadowed by them.
// - adc-core serves the content folder at the root (server.js,
//   express.static): /authors, /thumbs, /cahiers… are folders, so the server
//   only adds a trailing slash (removed by router.js) and lets the app answer.
//   A folder adc-core adds later behaves the same.
// - except /journal, that adc-core refuses (403).
// Also reserved: "authors", whose folder holds every account, to keep a
// cahier from looking like it.
export const RESERVED_SLUGS = ["journal", "authors"];

// close to the slug adc-core makes from a title (utils.slug, with slugg):
// enough to recognize the reserved ones
export const roughSlug = (text) =>
  String(text)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const isReservedTitle = (title) =>
  RESERVED_SLUGS.includes(roughSlug(title));
