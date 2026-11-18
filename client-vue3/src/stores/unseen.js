import { defineStore } from "pinia";
import { readJSON, writeJSON } from "@/adc/storage";

// Medias added from this browser that haven't been seen yet: outlined in
// the cahier until opened (MediaModal.vue marks them seen).
// Kept in this browser for each cahier.

const storageKey = (path_to_folder) => `cahiers.unseen.${path_to_folder}`;
// "cahiers/mon-cahier/photo.jpg.meta.txt" → "cahiers/mon-cahier"
const folderOf = (path_to_meta) =>
  path_to_meta.split("/").slice(0, -1).join("/");

export const useUnseenStore = defineStore("unseen", {
  state: () => ({
    // { "cahiers/mon-cahier": ["cahiers/mon-cahier/photo.jpg.meta.txt"] }
    by_folder: {},
  }),

  getters: {
    isUnseen: (state) => (path_to_meta) =>
      !!path_to_meta &&
      !!state.by_folder[folderOf(path_to_meta)]?.includes(path_to_meta),
  },

  actions: {
    // when a cahier opens, with its medias: those deleted meanwhile go
    load(path_to_folder, paths_to_meta) {
      const stored = readJSON(storageKey(path_to_folder));
      const existing = new Set(paths_to_meta);
      this.by_folder[path_to_folder] = (
        Array.isArray(stored) ? stored : []
      ).filter((path) => existing.has(path));
      this._save(path_to_folder);
    },
    add(path_to_meta) {
      const path_to_folder = folderOf(path_to_meta);
      if (!this.by_folder[path_to_folder])
        this.by_folder[path_to_folder] =
          readJSON(storageKey(path_to_folder)) || [];
      // through the store, for the change to show
      const list = this.by_folder[path_to_folder];
      if (list.includes(path_to_meta)) return;
      list.push(path_to_meta);
      this._save(path_to_folder);
    },
    markSeen(path_to_meta) {
      const path_to_folder = folderOf(path_to_meta);
      const list = this.by_folder[path_to_folder];
      if (!list?.includes(path_to_meta)) return;
      this.by_folder[path_to_folder] = list.filter((p) => p !== path_to_meta);
      this._save(path_to_folder);
    },
    _save(path_to_folder) {
      const list = this.by_folder[path_to_folder];
      writeJSON(storageKey(path_to_folder), list?.length ? list : undefined);
    },
  },
});
