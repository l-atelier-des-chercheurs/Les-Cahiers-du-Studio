// localStorage keeps values between visits, sessionStorage until the tab is
// closed. Both can be missing or throw (private mode, blocked site data).
type Where = "local" | "session";

function storage(where: Where) {
  return where === "session" ? sessionStorage : localStorage;
}

export function readJSON<T>(
  key: string,
  where: Where = "local"
): T | undefined {
  try {
    const raw = storage(where).getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function writeJSON(key: string, value: unknown, where: Where = "local") {
  try {
    if (value === undefined) storage(where).removeItem(key);
    else storage(where).setItem(key, JSON.stringify(value));
  } catch {
    // nothing is persisted, the app keeps working for this visit
  }
}
