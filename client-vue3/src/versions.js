// Version numbers, as in package.json (stores/appVersion.js, changelog.js)

// semver, prerelease included: 3.1.0-alpha.9 < 3.1.0-alpha.16 < 3.1.0.
// < 0 when a comes before b
export function compareVersions(a, b) {
  const split = (v) => {
    const [main, pre] = String(v).trim().split("-", 2);
    return {
      main: main.split(".").map((n) => parseInt(n, 10) || 0),
      pre: pre ? pre.split(".") : [],
    };
  };
  const x = split(a);
  const y = split(b);
  for (let i = 0; i < 3; i++) {
    const d = (x.main[i] || 0) - (y.main[i] || 0);
    if (d) return d;
  }
  // a release comes after its prereleases
  if (!x.pre.length || !y.pre.length) return y.pre.length - x.pre.length;
  for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
    const p = x.pre[i];
    const q = y.pre[i];
    if (p === undefined) return -1;
    if (q === undefined) return 1;
    const pn = /^\d+$/.test(p);
    const qn = /^\d+$/.test(q);
    if (pn && qn) {
      if (+p !== +q) return +p - +q;
    } else if (pn !== qn) return pn ? -1 : 1;
    else if (p !== q) return p < q ? -1 : 1;
  }
  return 0;
}
