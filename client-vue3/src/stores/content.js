import { defineStore } from "pinia";
import * as api from "@/adc/api";
import { joinRoom, leaveRoom, onConnectionChange, onEvent } from "@/adc/socket";

// Content loaded from the server, kept up to date by its socket events.
//
// A component opens what it shows, and closes it when it goes away:
//   created() { this.openFolder("cahiers/mon-cahier"); }
//   beforeUnmount() { this.closeFolder("cahiers/mon-cahier"); }
// Opening loads the content and listens to its changes. Closing stops
// listening: the content stays in the store, and is reloaded on next opening.
//
// Changes (create, update, remove) come back through the server, which
// broadcasts them to everyone, this browser included. Only a file's update
// is also applied from the server's answer (updateFile).

const parentOf = (path) => path.split("/").slice(0, -1).join("/");

// what is open, to fetch again after a cut (refresh): { path: count }
const opened_types = new Map();
const opened_folders = new Map();
function count(map, path, delta) {
  const n = (map.get(path) ?? 0) + delta;
  if (n > 0) map.set(path, n);
  else map.delete(path);
}
let refreshing = null;

// back to the tab after this long hidden: fetch again, even if the socket
// still looks connected (it may not have noticed the cut yet)
const HIDDEN_REFRESH_MS = 30 * 1000;

export const useContentStore = defineStore("content", {
  state: () => ({
    // every folder loaded, by path: { "cahiers/mon-cahier": meta }
    // a folder's $files is only there once the folder itself was opened
    folders: {},
    // folders of each type that was opened: { cahiers: ["cahiers/mon-cahier"] }
    lists: {},
    is_connected: false,
    // the socket connected once: losing it now is worth saying
    has_connected: false,
    // writes on their way to the server, and how the last one ended:
    // { ok: true | false, at: timestamp }, for the live indicator
    saving: 0,
    last_save: null,
  }),

  getters: {
    // this.getFolder("cahiers/mon-cahier")
    getFolder: (state) => (path_to_folder) => state.folders[path_to_folder],
    // this.getFolders("cahiers"): undefined until loaded
    getFolders: (state) => (path_to_type) =>
      state.lists[path_to_type]
        ?.map((path) => state.folders[path])
        .filter(Boolean),
  },

  actions: {
    // once, before the app starts
    init() {
      onConnectionChange((is_connected) => {
        // connected again after a cut: what happened meanwhile was missed
        if (is_connected && this.has_connected) this.refresh();
        this.is_connected = is_connected;
        if (is_connected) this.has_connected = true;
      });

      let hidden_at = 0;
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) hidden_at = Date.now();
        else if (hidden_at && Date.now() - hidden_at > HIDDEN_REFRESH_MS)
          this.refresh();
      });

      onEvent("folderCreated", ({ path_to_type, path_to_folder, meta }) => {
        this.folders[path_to_folder] = meta;
        const list = this.lists[path_to_type];
        if (list && !list.includes(path_to_folder)) list.push(path_to_folder);
      });
      onEvent("folderUpdated", ({ path_to_folder, changed_data }) => {
        const folder = this.folders[path_to_folder];
        if (folder) Object.assign(folder, changed_data);
      });
      onEvent("folderRemoved", ({ path_to_folder }) => {
        delete this.folders[path_to_folder];
        const path_to_type = parentOf(path_to_folder);
        if (this.lists[path_to_type])
          this.lists[path_to_type] = this.lists[path_to_type].filter(
            (path) => path !== path_to_folder
          );
      });

      onEvent("fileCreated", ({ path_to_folder, meta }) => {
        const files = this.folders[path_to_folder]?.$files;
        if (files && !files.some((f) => f.$path === meta.$path))
          files.push(meta);
      });
      onEvent("fileUpdated", ({ path_to_folder, path_to_meta, changed_data }) =>
        this._updateFileMeta(path_to_folder, path_to_meta, changed_data)
      );
      onEvent("fileRemoved", ({ path_to_folder, path_to_meta }) =>
        this._removeFiles(path_to_folder, [path_to_meta])
      );
      onEvent("filesRemoved", ({ path_to_folder, paths_to_meta }) =>
        this._removeFiles(path_to_folder, paths_to_meta)
      );
    },

    /* OPEN / CLOSE */

    // a type of folders, e.g. "cahiers"
    async openFolders(path_to_type) {
      joinRoom(path_to_type);
      count(opened_types, path_to_type, 1);
      return this.loadFolders(path_to_type);
    },
    // fetch again what the server lists, e.g. after logging in
    async loadFolders(path_to_type) {
      const folders = await api.getFolders(path_to_type);
      for (const folder of folders) {
        // keep the $files of folders that were opened
        const $files = this.folders[folder.$path]?.$files;
        this.folders[folder.$path] = $files ? { ...folder, $files } : folder;
      }
      this.lists[path_to_type] = folders.map((folder) => folder.$path);
      return this.getFolders(path_to_type);
    },
    closeFolders(path_to_type) {
      leaveRoom(path_to_type);
      count(opened_types, path_to_type, -1);
    },

    // one folder and its files, e.g. "cahiers/mon-cahier"
    async openFolder(path_to_folder) {
      joinRoom(path_to_folder);
      count(opened_folders, path_to_folder, 1);
      this.folders[path_to_folder] = await api.getFolder(path_to_folder);
      return this.folders[path_to_folder];
    },
    closeFolder(path_to_folder) {
      leaveRoom(path_to_folder);
      count(opened_folders, path_to_folder, -1);
    },

    // Fetch again everything open: the server's events missed while the
    // connection was cut (a phone asleep) are lost. The rooms are joined
    // again first (adc/socket.ts), so nothing slips in between; an event
    // also in what is fetched is harmless. One refresh at a time.
    refresh() {
      refreshing ||= (async () => {
        try {
          await Promise.all([
            ...[...opened_types.keys()].map((path_to_type) =>
              this.loadFolders(path_to_type)
            ),
            ...[...opened_folders.keys()].map(async (path_to_folder) => {
              this.folders[path_to_folder] =
                await api.getFolder(path_to_folder);
            }),
          ]);
        } catch (err) {
          console.error(err);
        } finally {
          refreshing = null;
        }
      })();
      return refreshing;
    },

    /* CHANGES: the store is updated by the server's events */

    // every write goes through here: counted while on its way, and its
    // outcome kept (LiveStatus.vue shows them). A cancelled upload is
    // neither saved nor failed.
    async _track(promise) {
      this.saving++;
      try {
        const result = await promise;
        this.last_save = { ok: true, at: Date.now() };
        return result;
      } catch (err) {
        if (err?.code !== "upload_aborted")
          this.last_save = { ok: false, at: Date.now() };
        throw err;
      } finally {
        this.saving--;
      }
    },

    // returns the path of the new folder
    createFolder(path_to_type, data) {
      return this._track(api.createFolder(path_to_type, data));
    },
    updateFolder(path_to_folder, data) {
      return this._track(api.updateFolder(path_to_folder, data));
    },
    removeFolder(path_to_folder) {
      return this._track(api.removeFolder(path_to_folder));
    },
    uploadFile(path_to_folder, file, additional_meta, onProgress, signal) {
      return this._track(
        api.uploadFile(
          path_to_folder,
          file,
          file.name,
          additional_meta,
          onProgress,
          signal
        )
      );
    },
    // without media: markers
    createFile(path_to_folder, meta) {
      return this._track(api.createFile(path_to_folder, meta));
    },
    // the server's answer is applied right away, as its fileUpdated event
    // will be (the same changes, twice is harmless): the store is right even
    // if the event is lost (connection dropped)
    async updateFile(path_to_meta, data) {
      const result = await this._track(api.updateFile(path_to_meta, data));
      const path_to_folder = parentOf(path_to_meta);
      this._updateFileMeta(path_to_folder, path_to_meta, result?.changed_data);
      return result;
    },
    removeFile(path_to_meta) {
      return this._track(api.removeFile(path_to_meta));
    },

    _updateFileMeta(path_to_folder, path_to_meta, changed_data) {
      const file = this.folders[path_to_folder]?.$files?.find(
        (f) => f.$path === path_to_meta
      );
      if (file && changed_data) Object.assign(file, changed_data);
    },
    _removeFiles(path_to_folder, paths_to_meta) {
      const folder = this.folders[path_to_folder];
      if (folder?.$files)
        folder.$files = folder.$files.filter(
          (f) => !paths_to_meta.includes(f.$path)
        );
    },
  },
});
