// Run by `npm version` (the "version" script, once package.json has the new
// version, before npm commits it): the "## À venir" section of CHANGELOG.md
// becomes "## <version> — <today>", and a new empty "## À venir" opens
// above it. The client, built right after, shows it (client-vue3/src/
// changelog.js).
//   node scripts/changelog-version.js [path/to/CHANGELOG.md]
// The version comes from npm (npm_package_version).

const fs = require("node:fs");
const path = require("node:path");

const UPCOMING = "## À venir";

const file = process.argv[2] || path.join(__dirname, "..", "CHANGELOG.md");
const version = process.env.npm_package_version;
if (!version) {
  console.error(
    "changelog-version: no npm_package_version (run by npm version)"
  );
  process.exit(1);
}

const text = fs.readFileSync(file, "utf8");
const lines = text.split("\n");
const start = lines.findIndex((line) => line.trim() === UPCOMING);
if (start === -1) {
  console.error(`changelog-version: no "${UPCOMING}" section in ${file}`);
  process.exit(1);
}

// nothing written under it: left as it is
const end = lines.findIndex((line, i) => i > start && line.startsWith("## "));
const items = lines
  .slice(start + 1, end === -1 ? undefined : end)
  .filter((line) => line.trim());
if (!items.length) {
  console.warn(
    `changelog-version: "${UPCOMING}" is empty, ${version} gets no entry`
  );
  process.exit(0);
}

// the local date, as git dates the tag
const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
].join("-");

lines.splice(start, 1, UPCOMING, "", `## ${version} — ${today}`);
fs.writeFileSync(file, lines.join("\n"));
console.log(`changelog-version: "${UPCOMING}" is now ${version} — ${today}`);
