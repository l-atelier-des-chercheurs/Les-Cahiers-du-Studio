// The app's changelog (CHANGELOG.md at the root of the repo, in French, for
// the people using the Cahiers), read at build time. Its sections:
//   ## 3.1.0-alpha.16 — 2026-11-20
//   - …
// "## À venir" (not released yet) is left out. `npm version` dates it
// (scripts/changelog-version.js). Imported with ChangelogModal.vue only:
// out of the main bundle.
import raw from "../../CHANGELOG.md?raw";
import { compareVersions } from "@/versions";

// [{ version, date, body }], as in the file: newest first
export function parseChangelog(text) {
  return String(text)
    .split(/^## /m)
    .slice(1)
    .map((section) => {
      const [heading, ...rest] = section.split("\n");
      const [version, date = ""] = heading.split(/\s+[—–-]\s+/);
      return {
        version: version.trim(),
        date: date.trim(),
        body: rest.join("\n").trim(),
      };
    })
    .filter(({ version }) => /^\d+\.\d+\.\d+/.test(version));
}

export const entries = parseChangelog(raw).sort((a, b) =>
  compareVersions(b.version, a.version)
);

// what came after `from`, up to `to`, newest first
export function entriesSince(from, to) {
  return entries.filter(
    ({ version }) =>
      (!from || compareVersions(version, from) > 0) &&
      (!to || compareVersions(version, to) <= 0)
  );
}
