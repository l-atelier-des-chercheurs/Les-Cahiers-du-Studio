import { defineStore } from "pinia";
import { readJSON, writeJSON } from "@/adc/storage";

// Medias this browser hasn't seen yet, whoever added them: outlined in the
// cahier until opened (MediaModal.vue) or hovered with the mouse
// (seenOnHover.js). Kept in this browser for each cahier, with the medias
// it already knows: one missing from that list is new. On a first visit,
// nothing is new.

const unseenKey = (path_to_folder) => `cahiers.unseen.${path_to_folder}`;
const knownKey = (path_to_folder) => `cahiers.known.${path_to_folder}`;
// "cahiers/mon-cahier/photo.jpg.meta.txt" → "cahiers/mon-cahier"
const folderOf = (path_to_meta) =>
  path_to_meta.split("/").slice(0, -1).join("/");
const readList = (key) => {
  const list = readJSON(key);
  return Array.isArray(list) ? list : undefined;
};

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
    // the cahier's medias, each time they change (CahierView.vue): those
    // not known yet are new, those deleted are forgotten
    sync(path_to_folder, paths_to_meta) {
      const existing = new Set(paths_to_meta);
      const known = readList(knownKey(path_to_folder));
      const unseen = (
        this.by_folder[path_to_folder] ||
        readList(unseenKey(path_to_folder)) ||
        []
      ).filter((path) => existing.has(path));
      if (known) {
        const was_known = new Set(known);
        for (const path of paths_to_meta)
          if (!was_known.has(path) && !unseen.includes(path)) unseen.push(path);
      }
      this.by_folder[path_to_folder] = unseen;
      this._save(path_to_folder);
      writeJSON(knownKey(path_to_folder), paths_to_meta);
    },
    add(path_to_meta) {
      const path_to_folder = folderOf(path_to_meta);
      if (!this.by_folder[path_to_folder])
        this.by_folder[path_to_folder] =
          readList(unseenKey(path_to_folder)) || [];
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
      writeJSON(unseenKey(path_to_folder), list?.length ? list : undefined);
    },
  },
});
