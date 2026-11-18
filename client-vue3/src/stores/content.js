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

export const useContentStore = defineStore("content", {
  state: () => ({
    // every folder loaded, by path: { "cahiers/mon-cahier": meta }
    // a folder's $files is only there once the folder itself was opened
    folders: {},
    // folders of each type that was opened: { cahiers: ["cahiers/mon-cahier"] }
    lists: {},
    is_connected: false,
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
      onConnectionChange((is_connected) => (this.is_connected = is_connected));

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
    },

    // one folder and its files, e.g. "cahiers/mon-cahier"
    async openFolder(path_to_folder) {
      joinRoom(path_to_folder);
      this.folders[path_to_folder] = await api.getFolder(path_to_folder);
      return this.folders[path_to_folder];
    },
    closeFolder(path_to_folder) {
      leaveRoom(path_to_folder);
    },

    /* CHANGES: the store is updated by the server's events */

    // returns the path of the new folder
    createFolder(path_to_type, data) {
      return api.createFolder(path_to_type, data);
    },
    updateFolder(path_to_folder, data) {
      return api.updateFolder(path_to_folder, data);
    },
    removeFolder(path_to_folder) {
      return api.removeFolder(path_to_folder);
    },
    uploadFile(path_to_folder, file, additional_meta, onProgress, signal) {
      return api.uploadFile(
        path_to_folder,
        file,
        file.name,
        additional_meta,
        onProgress,
        signal
      );
    },
    // without media: markers
    createFile(path_to_folder, meta) {
      return api.createFile(path_to_folder, meta);
    },
    // the server's answer is applied right away, as its fileUpdated event
    // will be (the same changes, twice is harmless): the store is right even
    // if the event is lost (connection dropped)
    async updateFile(path_to_meta, data) {
      const result = await api.updateFile(path_to_meta, data);
      const path_to_folder = parentOf(path_to_meta);
      this._updateFileMeta(path_to_folder, path_to_meta, result?.changed_data);
      return result;
    },
    removeFile(path_to_meta) {
      return api.removeFile(path_to_meta);
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
