import { authorizationHeader } from "./auth";
import { ApiError } from "./types";
import type { FileMeta, FolderMeta, Path } from "./types";

// Thin wrapper around adc-core's REST API (server/api2.js), mounted on /_api2/.
// Paths are content paths: "cahiers", "cahiers/mon-cahier",
// "cahiers/mon-cahier/photo.jpg.meta.txt"…

// error bodies are { code, err_infos? }
function toApiError(status: number, status_text: string, body: unknown) {
  const { code, err_infos } = (body ?? {}) as {
    code?: string;
    err_infos?: unknown;
  };
  return new ApiError(status, code ?? status_text, err_infos);
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: authorizationHeader(),
  };
  let payload: BodyInit | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`/_api2/${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => undefined);
  if (!res.ok) throw toApiError(res.status, res.statusText, data);
  return data as T;
}

/* VERSION */

// the app's version on the server (adc-core 0.2.13+), compared with the
// page's (stores/appVersion.js). undefined when unknown: an older adc-core
// answers its page instead, a cut connection nothing
export async function getServerVersion(): Promise<string | undefined> {
  try {
    const res = await fetch("/_api2/_version", { cache: "no-store" });
    if (!res.ok) return undefined;
    const data = await res.json();
    return typeof data?.version === "string" ? data.version : undefined;
  } catch {
    return undefined;
  }
}

/* AUTH */

// GET /_authCheck answers 200 when there is no general password,
// or when the submitted one is right
export async function checkGeneralPassword(): Promise<boolean> {
  return request("GET", "_authCheck")
    .then(() => true)
    .catch((err) => {
      if (err instanceof ApiError && err.status === 401) return false;
      throw err;
    });
}

// is the token of the current credentials still valid
// (tokens expire after settings.tokenIsValidForXDays, or are revoked)
export async function isTokenValid(): Promise<boolean> {
  return request("GET", "_tokenCheck")
    .then(() => true)
    .catch((err) => {
      if (err instanceof ApiError && err.status === 401) return false;
      throw err;
    });
}

// returns a token for this author
export async function login(
  path_to_author: Path,
  password: string
): Promise<string> {
  const { token } = await request<{ token: string }>(
    "POST",
    `${path_to_author}/_login`,
    { $password: password }
  );
  return token;
}

export async function logout(token: string, token_path: Path) {
  await request("POST", `${token_path}/_logout`, { token });
}

/* FOLDERS */

export function getFolders(path_to_type: Path) {
  return request<FolderMeta[]>("GET", path_to_type);
}

// includes $files
export function getFolder(path_to_folder: Path) {
  return request<FolderMeta>("GET", path_to_folder);
}

export async function createFolder(
  path_to_type: Path,
  data: Record<string, unknown>
) {
  const { new_folder_slug } = await request<{ new_folder_slug: string }>(
    "POST",
    `${path_to_type}/_create`,
    data
  );
  return `${path_to_type}/${new_folder_slug}`;
}

export function updateFolder(
  path_to_folder: Path,
  data: Record<string, unknown>
) {
  return request("PATCH", path_to_folder, data);
}

export function removeFolder(path_to_folder: Path) {
  return request("DELETE", path_to_folder);
}

/* FILES */

export function getFile(path_to_meta: Path) {
  return request<FileMeta>("GET", path_to_meta);
}

type UploadResult = { meta_filename: string; uploaded_meta: FileMeta };

// adc-core reads one file and one field, whose value is the JSON of the
// meta to set (fields of the schema's $files, requested_slug…)
export async function uploadFile(
  path_to_folder: Path,
  file: Blob,
  filename: string,
  additional_meta: Record<string, unknown> = {},
  onProgress?: (ratio: number) => void,
  // aborting rejects with the code "upload_aborted"
  signal?: AbortSignal
): Promise<UploadResult> {
  const form = new FormData();
  form.append("additional_meta", JSON.stringify(additional_meta));
  form.append("file", file, filename);

  if (!onProgress && !signal)
    return request("POST", `${path_to_folder}/_upload`, form);

  // fetch can't report upload progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/_api2/${path_to_folder}/_upload`);
    xhr.setRequestHeader("Authorization", authorizationHeader());
    xhr.upload.onprogress = (e) =>
      e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => {
      let data: unknown;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // not JSON: keep data undefined, the status tells what happened
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data as UploadResult);
      else reject(toApiError(xhr.status, xhr.statusText, data));
    };
    xhr.onerror = () => reject(new ApiError(0, "network_error"));
    xhr.onabort = () => reject(new ApiError(0, "upload_aborted"));
    if (signal?.aborted) return reject(new ApiError(0, "upload_aborted"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(form);
  });
}

// a file without media, only its .meta.txt (adc-core's meta-only import:
// a JSON body instead of a form). Never pass a `url` field: adc-core
// would download it.
export function createFile(
  path_to_folder: Path,
  meta: Record<string, unknown>
): Promise<UploadResult> {
  return request("POST", `${path_to_folder}/_upload`, meta);
}

export function updateFile(path_to_meta: Path, data: Record<string, unknown>) {
  return request("PATCH", path_to_meta, data);
}

export function removeFile(path_to_meta: Path) {
  return request("DELETE", path_to_meta);
}

// the new $thumbs come through the fileUpdated event
export function regenerateThumbs(path_to_meta: Path) {
  return request("PATCH", `${path_to_meta}/_regenerateThumbs`);
}

// starts an export task converting a media (recipe "optimize_media"): its
// progress and end come through the taskStatus / taskEnded events, in the
// room "task_<task_id>"; the new media through fileCreated
export function optimizeFile(
  path_to_meta: Path,
  instructions: Record<string, unknown>
): Promise<{ task_id: string }> {
  return request("POST", `${path_to_meta}/_optimize`, instructions);
}

/* MEDIA URLS: the content folder is served from / */

function contentURL(path: Path) {
  const [p = "", query] = path.split("?");
  return (
    "/" +
    p.split("/").map(encodeURIComponent).join("/") +
    (query ? "?" + query : "")
  );
}

function folderOf(meta: FileMeta) {
  return meta.$path.split("/").slice(0, -1).join("/");
}

// regenerated thumbs keep their names: $thumbs_version (set by the store,
// not by adc-core) changes their URLs, for the browser to fetch them again
function thumbPath(meta: FileMeta, name: string) {
  const version = meta.$thumbs_version;
  return `thumbs/${folderOf(meta)}/${name}${version ? `?v=${version}` : ""}`;
}

export function mediaURL(meta: FileMeta) {
  if (!meta.$media_filename) return undefined;
  return contentURL(`${folderOf(meta)}/${meta.$media_filename}`);
}

// thumbs live in thumbs/<folder path>/, named in $thumbs:
// { <resolution>: name } for images, { <suffix>: { <resolution>: name } }
// for media with several previews (videos…), where we take the first one
// Every thumb of a media, for an <img srcset>: "url 220w, url 440w…".
// adc-core fits them in a square (sharp, fit: "inside"): the resolution is
// the longest side, so a portrait thumb is narrower. aspect: width / height
export function thumbSrcset(meta: FileMeta, aspect = 1) {
  const thumbs = meta.$thumbs as
    Record<string, string | Record<string, string>> | undefined;
  if (!thumbs || typeof thumbs !== "object") return "";
  const first = Object.values(thumbs)[0];
  const set = (typeof first === "string" ? thumbs : first) as Record<
    string,
    string
  >;
  return Object.entries(set)
    .filter(([res, name]) => +res > 0 && typeof name === "string")
    .sort(([a], [b]) => +a - +b)
    .map(([res, name]) => {
      const width = aspect >= 1 ? +res : Math.round(+res * aspect);
      return `${contentURL(thumbPath(meta, name))} ${width}w`;
    })
    .join(", ");
}

export function thumbURL(meta: FileMeta, resolution: number) {
  const thumbs = meta.$thumbs as
    Record<string, string | Record<string, string>> | undefined;
  if (!thumbs || typeof thumbs !== "object") return undefined;
  const set = resolution in thumbs ? thumbs : Object.values(thumbs)[0];
  const name = typeof set === "object" ? set[resolution] : undefined;
  if (typeof name !== "string") return undefined;
  return contentURL(thumbPath(meta, name));
}
