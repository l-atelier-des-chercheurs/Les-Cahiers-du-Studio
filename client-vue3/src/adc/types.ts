// Shapes sent by adc-core (server/api2.js, folder.js, file.js).
// Only what the client reads so far: extend as needed.

// paths are slash-separated and relative to the content folder,
// e.g. "cahiers/mon-cahier" or "cahiers/mon-cahier/photo.jpg.meta.txt"
export type Path = string;

export type Meta = {
  $path: Path;
  $date_created?: string;
  $date_modified?: string;
  $admins?: Path[] | "everyone" | "parent_contributors";
  $contributors?: Path[] | "everyone" | "parent_contributors";
  $status?: string;
  [field: string]: unknown;
};

export type Thumb = { path: Path; size: number; ratio?: number };

export type FileMeta = Meta & {
  $type?:
    "image" | "video" | "audio" | "text" | "pdf" | "url" | "other" | string;
  $media_filename?: string;
  $thumbs?: Record<string, unknown>;
  // client only: when the thumbs were last regenerated (stores/content.js)
  $thumbs_version?: number;
  $infos?: Record<string, unknown>;
  $date_uploaded?: string;
};

export type FolderMeta = Meta & {
  $files?: FileMeta[];
  $cover?: Record<string, unknown>;
};

export type AppInfos = {
  schema: Record<string, unknown>;
  version: string;
  product_name: string;
  debug_mode: boolean;
  is_electron: boolean;
  page_is_standalone_html: boolean;
  public_url: string;
  instance_meta: {
    name: string;
    presentation: string;
    contactmail: string;
    has_general_password: boolean;
    can_send_email: boolean;
    require_signup_to_contribute: boolean;
    require_mail_to_signup: boolean;
    enable_chats: boolean;
    $admins: Path[] | "everyone";
    $contributors: Path[] | "everyone";
    [field: string]: unknown;
  };
};

// events broadcast to the sockets of a room (adc-core server/sockets.js)
export type ServerEvents = {
  folderCreated: { path_to_type: Path; path_to_folder: Path; meta: FolderMeta };
  folderUpdated: { path_to_folder: Path; changed_data: Partial<FolderMeta> };
  folderRemoved: { path_to_folder: Path };
  fileCreated: { path_to_folder: Path; meta: FileMeta };
  fileUpdated: {
    path_to_folder: Path;
    path_to_meta: Path;
    changed_data: Partial<FileMeta>;
  };
  fileRemoved: { path_to_folder: Path; path_to_meta: Path };
  filesRemoved: { path_to_folder: Path; paths_to_meta: Path[] };
  // export tasks (adc-core's Exporter.js), in the room "task_<task_id>":
  // progress from 0 to 100, then the end: the new file once completed, the
  // reason (info) once failed
  taskStatus: { task_id: string; progress: number };
  taskEnded: {
    task_id: string;
    event: "completed" | "failed" | "aborted";
    message?: { file?: FileMeta; info?: string };
  };
};

// error bodies are { code, err_infos? }
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public err_infos?: unknown
  ) {
    super(code);
  }
}
