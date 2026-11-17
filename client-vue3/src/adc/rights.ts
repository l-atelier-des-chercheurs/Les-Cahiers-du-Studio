import type { Meta, Path } from "./types";

// What the logged-in author may do with a folder, from its $admins and
// $contributors, as adc-core checks it (server/api2.js _canContributeToFolder,
// _canAdminFolder). Only to adapt the interface: the server decides.

type AuthorList = Meta["$admins"];

function isIn(list: AuthorList, token_path?: Path) {
  if (list === "everyone") return true;
  return !!token_path && Array.isArray(list) && list.includes(token_path);
}

export function isInstanceAdmin(token_path?: Path) {
  return isIn(window.app_infos?.instance_meta?.$admins, token_path);
}

export function canAdminFolder(folder: Meta, token_path?: Path) {
  return isInstanceAdmin(token_path) || isIn(folder.$admins, token_path);
}

export function canContributeToFolder(folder: Meta, token_path?: Path) {
  return (
    canAdminFolder(folder, token_path) || isIn(folder.$contributors, token_path)
  );
}

// adc-core still lists private folders to everyone (GET /_api2/<type>),
// but refuses to open them to non-contributors: hide them
export function canSeeFolder(folder: Meta, token_path?: Path) {
  return (
    folder.$status !== "private" || canContributeToFolder(folder, token_path)
  );
}
