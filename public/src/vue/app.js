/** *********
  VUE
***********/

// The following line loads the standalone build of Vue instead of the runtime-only build,
// so you don't have to do: import Vue from 'vue/dist/vue'
// This is done with the browser options. For the config, see package.json
import Vue from "vue";

import localstore from "store";
import VueScrollTo from "vue-scrollto";
import PortalVue from "portal-vue";
import VueI18n from "vue-i18n";

import alertify from "alertify.js";
Vue.prototype.$alertify = alertify;

import auth from "../adc-core/auth-client.js";
auth.init();
Vue.prototype.$auth = auth;

import slug from "slugg";
Vue.prototype.$slug = slug;

import VuePackeryPlugin from "vue-packery-plugin";
Vue.use(VuePackeryPlugin);

import VuePlyr from "vue-plyr";
Vue.use(VuePlyr);

import VueDragscroll from "vue-dragscroll";
Vue.use(VueDragscroll);

// import VueDraggabillyPlugin from './vue-packery-draggabilly-plugin';
// Vue.use(VueDraggabillyPlugin);

import _ from "lodash";
Vue.prototype.$_ = _;

import locale_strings from "./locale_strings.js";

Vue.config.silent = false;
Vue.config.devtools = true;

Vue.prototype.$eventHub = new Vue(); // Global event bus

Vue.use(VueScrollTo);
Vue.use(PortalVue);
Vue.use(VueI18n);

let lang_settings = {
  available: {
    fr: "Français",
    en: "English"
  },
  default: "en",
  current: "",
  init: function() {
    let localstore_lang = localstore.get("language");

    // has lang set
    if (localstore_lang !== undefined) {
      // exists in available
      if (this.available[localstore_lang] !== undefined) {
        this.current = localstore_lang;
      }
    }

    if (this.current === "") {
      // set current lang from
      let browserLangIsAvailable = Object.keys(this.available).filter(x => {
        return window.navigator.language.includes(x);
      });
      if (browserLangIsAvailable.length > 0) {
        this.current = browserLangIsAvailable[0];
      }
    }

    if (this.current === "") {
      this.current = "en";
    }
  }
};
lang_settings.init();

import moment from "moment";
import "moment/locale/fr";
import "moment/locale/en-gb";

moment.locale(lang_settings.current);
Vue.prototype.$moment = moment;

const html = document.documentElement; // returns the html tag
html.setAttribute("lang", lang_settings.current);

// Create VueI18n instance with options
let i18n = new VueI18n({
  locale: lang_settings.current, // set locale
  messages: locale_strings // set locale messages
});

/** *********
  SOCKETIO
***********/
import custom_socketio from "../adc-core/custom-socketio.js";
Vue.prototype.$socketio = custom_socketio.init(i18n, auth, alertify);

import App from "./App.vue";

let vm = new Vue({
  // eslint-disable-line no-new
  i18n,
  el: "#app",
  components: { App },
  template: `
    <App
      :current_slugFolderName="settings.current_slugFolderName"
      :currentFolder="currentFolder"
    />
  `,
  data: {
    store: window.store,
    state: window.state,

    access: false,

    currentTime: "",

    justCreatedMediaID: false,
    justCreatedFolderID: false,
    justCreatedFolderPassword: false,

    media_modal: {
      open: false,
      minimized: false,
      show_sidebar: true
    },

    settings: {
      has_modal_opened: false,
      has_writeup_opended: false,
      current_slugFolderName: "",
      has_sidebar_opened: false,
      sidebar_type: "",

      highlightMedia: "",
      is_loading_medias_for_folder: false,
      enable_system_bar: window.state.is_electron && window.state.is_darwin,
      perf_mode: "low",

      keyboard_shortcuts: [],

      current_author_name: false,
      setDateTimelineToDateCreated: false,

      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,

      folder_view_mode: "timeline"
    },

    lang: {
      available: lang_settings.available,
      current: lang_settings.current
    }
  },
  created() {
    if (window.state.dev_mode === "debug") {
      console.log("ROOT EVENT: created");
    }
    if (this.settings.enable_system_bar) {
      document.body.classList.add("has_systembar");
    }

    if (window.state.dev_mode === "debug") {
      console.log("ROOT EVENT: created / checking for errors");
    }

    this.settings.keyboard_shortcuts = this.getKeyboardShortcuts();

    window.addEventListener("resize", () => {
      this.settings.windowWidth = window.innerWidth;
      this.settings.windowHeight = window.innerHeight;
    });

    if (
      window.state.hasOwnProperty("export_options") &&
      !!window.state.export_options.password_protect
    ) {
      let hashCode = function(s) {
        return s.split("").reduce(function(a, b) {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
      };

      let mdp = prompt("Password for application :");

      if ("" + hashCode(mdp) !== window.state.export_options.password_protect) {
        window.alert("This password is not valid.");
        return;
      }
    }

    this.access = true;

    if (this.state.mode === "export_web") {
      // this.settings.has_sidebar_opened = true;
      if (Object.keys(this.store.folders).length > 0) {
        this.settings.current_slugFolderName = Object.keys(
          this.store.folders
        )[0];
      }
    }

    if (this.store.noticeOfError) {
      if (this.store.noticeOfError === "failed_to_find_folder") {
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t('notifications["failed_to_get_folder:"]') +
              " " +
              this.store.request.slugFolderName
          );
      }
    } else {
      if (window.state.dev_mode === "debug") {
        console.log(
          "ROOT EVENT: created / no errors, checking for content to load"
        );
      }

      this.currentTime = this.$moment().millisecond(0);
      setInterval(
        () => (this.currentTime = this.$moment().millisecond(0)),
        1000
      );

      if (this.store.request.slugFolderName) {
        this.settings.current_slugFolderName = this.store.request.slugFolderName;
        this.settings.is_loading_medias_for_folder = this.store.request.slugFolderName;
        this.$eventHub.$once("socketio.folders.folders_listed", () => {
          this.openFolder(this.store.request.slugFolderName);
        });
        // requesting edit of a media
        if (this.store.request.metaFileName) {
          this.$eventHub.$once("socketio.folders.listMedias", () => {
            this.$nextTick(() => {
              this.$eventHub.$emit(
                "timeline.openMediaModal",
                this.store.request.metaFileName + ".txt"
              );
            });
          });
        }
      }
    }

    this.$eventHub.$on("socketio.reconnect", () => {
      if (this.settings.current_slugFolderName) {
        this.$socketio.listFolder({
          type: "folders",
          slugFolderName: this.settings.current_slugFolderName
        });
        this.$socketio.listMedias({
          type: "folders",
          slugFolderName: this.settings.current_slugFolderName
        });
      }
    });

    window.onpopstate = event => {
      console.log(
        `ROOT EVENT: popstate with event.state.slugFolderName = ${event.state.slugFolderName}`
      );
      this.settings.current_slugFolderName = event.state.slugFolderName;
    };

    if (this.state.mode === "live") {
      console.log("ROOT EVENT: created / now connecting with socketio");

      if (!this.$root.state.is_electron) {
        this.$eventHub.$on("socketio.connect", () => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t('notifications["connected_to_lescahiers"]'));
        });
        this.$eventHub.$on("socketio.reconnect", () => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t('notifications["connected_to_lescahiers"]'));
        });
      }

      this.$socketio.connect();

      this.$eventHub.$once("socketio.authentificated", () => {
        this.$socketio.listFolders({ type: "folders" });
      });
    }
  },
  methods: {
    createFolder: function(fdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }

      if (fdata.password !== "") {
        this.justCreatedFolderPassword = fdata.password;
      }

      this.justCreatedFolderID = fdata.id =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15);

      this.$socketio.createFolder(fdata);
    },
    editFolder: function(fdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: editFolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }
      this.$socketio.editFolder(fdata);
    },
    removeFolder: function(slugFolderName) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: removeFolder: ${slugFolderName}`);
      }
      this.$socketio.removeFolder(slugFolderName);
    },

    createMedia: function(mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: createMedia`);
      }
      this.justCreatedMediaID = mdata.id =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15);

      if (this.settings.current_author_name) {
        if (!mdata.hasOwnProperty("additionalMeta")) {
          mdata.additionalMeta = {};
        }
        // only set author to current if no author is already set
        // (for example, with an author shortcut)
        if (!mdata.additionalMeta.hasOwnProperty("authors")) {
          mdata.additionalMeta.authors = [
            { name: this.$root.settings.current_author_name }
          ];
        }
      }

      this.$nextTick(() => {
        this.$socketio.createMedia(mdata);
      });
    },

    removeMedia: function(mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: removeMedia: ${JSON.stringify(mdata, null, 4)}`
        );
      }
      this.$socketio.removeMedia(mdata);
    },
    editMedia: function(mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`);
      }
      this.$socketio.editMedia(mdata);
    },
    editMedia: function(mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`);
      }
      this.$socketio.editMedia(mdata);
    },

    openFolder: function(slugFolderName) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: openFolder: ${slugFolderName}`);
      }
      if (!this.store.folders.hasOwnProperty(slugFolderName)) {
        console.log("Missing folder key on the page, aborting.");
        this.closeFolder();
        return false;
      }

      // prevent access to folder if user doesn’t have the password
      if (
        !this.canAdminFolder({
          type: "folders",
          slugFolderName
        })
      ) {
        console.log("Can’t access folder, not opening folder.");
        this.closeFolder();
        return false;
      }

      this.settings.current_slugFolderName = slugFolderName;
      this.settings.is_loading_medias_for_folder = slugFolderName;

      this.$nextTick(() => {
        this.$socketio.listMedias({
          type: "folders",
          slugFolderName
        });
      });

      history.pushState(
        { slugFolderName },
        this.store.folders[slugFolderName].name,
        "/" + slugFolderName
      );

      this.$eventHub.$once("socketio.folders.listMedias", () => {
        this.settings.is_loading_medias_for_folder = false;
      });
    },
    closeFolder: function() {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: closeFolder");
      }
      this.settings.current_slugFolderName = "";
      history.pushState({ slugFolderName: "" }, "", "/");
    },
    updateFolderScale: function(slugFolderName, timelineViewport_scale) {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: updateFolderScale");
      }

      let viewportScale = localstore.get("viewport_scale") || {};
      viewportScale[slugFolderName] = timelineViewport_scale;

      localstore.set("viewport_scale", viewportScale);
    },
    getFolderScale: function(slugFolderName) {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: getFolderScale");
      }
      let viewportScale = localstore.get("viewport_scale") || {};
      if (
        viewportScale !== undefined &&
        viewportScale[slugFolderName] !== undefined
      ) {
        return viewportScale[slugFolderName];
      }
      if (this.state.mode === "export_web") {
        return 50;
      }
      return 20;
    },

    updateLocalLang: function(newLangCode) {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: updateLocalLang");
      }

      i18n.locale = newLangCode;
      moment.locale(newLangCode);

      this.lang.current = newLangCode;

      const html = document.documentElement; // returns the html tag
      html.setAttribute("lang", newLangCode);

      localstore.set("language", newLangCode);
    },

    updateFolderScrollLeft: function(
      slugFolderName,
      timelineViewport_scrollLeft
    ) {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: updateFolderScrollLeft");
      }

      let viewportScrollLeft = localstore.get("viewport_scrollLeft") || {};
      viewportScrollLeft[slugFolderName] = timelineViewport_scrollLeft;

      localstore.set("viewport_scrollLeft", viewportScrollLeft);
    },
    getScrollLeft: function(slugFolderName) {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: getScrollLeft");
      }
      let viewportScrollLeft = localstore.get("viewport_scrollLeft") || {};
      if (
        viewportScrollLeft !== undefined &&
        viewportScrollLeft[slugFolderName] !== undefined
      ) {
        return viewportScrollLeft[slugFolderName];
      }
      return 0;
    },
    updateKeyboardShortcuts: function(keyboard_shortcuts) {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: updateKeyboardShortcuts");
      }
      localstore.set("keyboard_shortcuts", keyboard_shortcuts);
      this.settings.keyboard_shortcuts = keyboard_shortcuts;
    },
    getKeyboardShortcuts: function() {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: getKeyboardShortcuts");
      }
      let kbs = localstore.get("keyboard_shortcuts") || [];
      return kbs;
    },
    mediaColorFromFirstAuthor(media, folder) {
      const author = this.mediaFirstAuthor(media, folder);
      if (author) {
        return author.color;
      }
      return false;
    },
    mediaFirstAuthor(media, folder) {
      if (!media.hasOwnProperty("authors") || !Array.isArray(media.authors)) {
        return false;
      }

      const first_media_author = media.authors.find(
        a => a.hasOwnProperty("name") && !!a.name
      );

      if (
        !first_media_author ||
        !Array.isArray(folder.authors) ||
        folder.authors.length === 0
      )
        return false;

      const full_authors_info = folder.authors.filter(
        a => a.name === first_media_author.name
      );
      if (full_authors_info.length == 0) {
        return false;
      }

      return full_authors_info[0];
    },
    canAdminFolder: function({ type, slugFolderName }) {
      if (!this.store[type].hasOwnProperty(slugFolderName)) return false;

      // if folder doesn’t have a password set
      if (this.store[type][slugFolderName].password !== "has_pass") {
        return true;
      }

      const has_reference_to_folder = this.state.list_authorized_folders.filter(
        i => {
          if (
            !!i &&
            i.hasOwnProperty("type") &&
            i.type === type &&
            i.hasOwnProperty("allowed_slugFolderNames") &&
            i.allowed_slugFolderNames.indexOf(slugFolderName) >= 0
          )
            return true;
          return false;
        }
      );

      if (has_reference_to_folder.length > 0) {
        return true;
      }
      return false;
    }
  },
  watch: {
    "settings.has_modal_opened": function() {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: var has changed: has_modal_opened: ${this.settings.has_modal_opened}`
        );
      }
      if (this.has_modal_opened) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  },
  computed: {
    currentFolder: function() {
      if (
        this.store.hasOwnProperty("folders") &&
        this.store.folders.hasOwnProperty(this.settings.current_slugFolderName)
      ) {
        return this.store.folders[this.settings.current_slugFolderName];
      }
      return {};
    },
    currentTime_human() {
      return this.$moment(this.currentTime).format("l LTS");
    },
    currentTime_minute() {
      return this.$moment(this.currentTime).second(0);
    },
    currentTime_day() {
      return this.$moment(this.currentTime).startOf("day");
    },
    allKeywords() {
      let allKeywords = [];
      for (let slugFolderName in this.store.folders) {
        const folder = this.store.folders[slugFolderName];
        let folderKeywords = folder.keywords;
        if (!!folderKeywords) {
          folderKeywords.map(val => {
            allKeywords.push(val.title);
          });
        }
        if (
          folder.hasOwnProperty("medias") &&
          Object.keys(folder.medias).length > 0
        ) {
          Object.values(folder.medias).map(m => {
            if (
              m.hasOwnProperty("keywords") &&
              typeof m.keywords === "object" &&
              m.keywords.length > 0
            ) {
              allKeywords = allKeywords.concat(m.keywords.map(k => k.title));
            }
          });
        }
      }
      allKeywords = allKeywords.filter(function(item, pos) {
        return allKeywords.indexOf(item) == pos;
      });

      return allKeywords.map(kw => {
        return {
          text: kw,
          classes: "tagcolorid_" + (parseInt(kw, 36) % 2)
        };
      });
    }
  }
});
