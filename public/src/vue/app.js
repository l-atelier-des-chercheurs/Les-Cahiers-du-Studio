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
    en: "English",
  },
  default: "en",
  current: "",
  init: function () {
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
      let browserLangIsAvailable = Object.keys(this.available).filter((x) => {
        return window.navigator.language.includes(x);
      });
      if (browserLangIsAvailable.length > 0) {
        this.current = browserLangIsAvailable[0];
      }
    }

    if (this.current === "") {
      this.current = "en";
    }
  },
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
  messages: locale_strings, // set locale messages
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

    current_time: {
      seconds: "",
      minutes: "",
      days: "",
    },

    justCreatedMediaID: false,
    justCreatedFolderID: false,
    justCreatedFolderPassword: false,

    media_modal: {
      open: false,
      minimized: false,
      show_sidebar: true,
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

      current_chat_slug: false,

      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,

      folder_view_mode: "timeline",
    },

    lang: {
      available: lang_settings.available,
      current: lang_settings.current,
    },
  },
  created() {
    if (window.state.dev_mode === "debug") {
      console.log("ROOT EVENT: created");
    }
    if (this.settings.enable_system_bar) {
      document.body.classList.add("has_systembar");
    }
    document.body.setAttribute("data-mode", this.state.mode);

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
      let hashCode = function (s) {
        return s.split("").reduce(function (a, b) {
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

      this.current_time.seconds = this.$moment().millisecond(0);
      setInterval(
        () => (this.current_time.seconds = this.$moment().millisecond(0)),
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
      this.$socketio.listFolders({ type: "folders" });
      this.$socketio.listFolders({ type: "authors" });
      this.$socketio.listFolders({ type: "chats" });

      if (this.settings.current_slugFolderName) {
        this.$socketio.listFolder({
          type: "folders",
          slugFolderName: this.settings.current_slugFolderName,
        });
        this.$socketio.listMedias({
          type: "folders",
          slugFolderName: this.settings.current_slugFolderName,
        });
      }
    });

    window.onpopstate = (event) => {
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
        this.$socketio.listFolders({ type: "authors" });
        this.$socketio.listFolders({ type: "chats" });
      });
    }
  },
  methods: {
    createFolder: function (fdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }

      if (fdata.password !== "") {
        this.justCreatedFolderPassword = fdata.password;
      }

      this.justCreatedFolderID = fdata.id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      this.$socketio.createFolder(fdata);
    },
    editFolder: function (fdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: editFolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }
      this.$socketio.editFolder(fdata);
    },
    removeFolder: function (slugFolderName) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: removeFolder: ${slugFolderName}`);
      }
      this.$socketio.removeFolder(slugFolderName);
    },
    formatDateToCalendar(date) {
      return this.$moment(date, "YYYY-MM-DD HH:mm:ss").calendar();
    },
    getUnreadMessageCount(chat) {
      if (!this.current_author) return false;

      if (
        !this.canSeeFolder({
          type: "chats",
          slugFolderName: chat.slugFolderName,
        })
      )
        return false;

      const total_number_of_messages_in_chat = chat.number_of_medias;

      // find media with meta
      const last_messages_read_in_channels = this.current_author
        .last_messages_read_in_channels;

      if (last_messages_read_in_channels) {
        const existing_info = last_messages_read_in_channels.find(
          (c) => c.channel === chat.slugFolderName
        );

        if (existing_info) {
          // const last_message_metaFileName = existing_info.metaFileName;
          // const index_of_past_message_read = Object.values(
          //   chat.medias
          // ).findIndex((m) => m.metaFileName === existing_info.msg);
          // return (
          //   total_number_of_messages_in_chat - index_of_past_message_read - 1
          // );
          // using index for performance reason (no need to list all chats to get a rough unread count)
          if (existing_info.hasOwnProperty("index")) {
            return Math.max(
              0,
              total_number_of_messages_in_chat - Number(existing_info.index)
            );
          }
        }
      }

      return Math.max(0, total_number_of_messages_in_chat);
    },
    openChat(slugFolderName) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: openChat: ${slugFolderName}`);
      }

      if (
        !Object.values(this.store.chats).some(
          (c) => c.slugFolderName === slugFolderName
        )
      ) {
        this.$root.createFolder({
          type: "chats",
          data: {
            is_linked_to: slugFolderName,
          },
        });
      }
      this.settings.current_chat_slug = slugFolderName;
    },
    closeChat() {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: closeChat`);
      }
      this.settings.current_chat_slug = false;
    },
    createMedia: function (mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: createMedia`);
      }
      this.justCreatedMediaID = mdata.id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      if (this.settings.current_author_name) {
        if (!mdata.hasOwnProperty("additionalMeta")) {
          mdata.additionalMeta = {};
        }
        // only set author to current if no author is already set
        // (for example, with an author shortcut)
        if (!mdata.additionalMeta.hasOwnProperty("authors")) {
          mdata.additionalMeta.authors = [
            { name: this.$root.settings.current_author_name },
          ];
        }
      }

      this.$nextTick(() => {
        this.$socketio.createMedia(mdata);
      });
    },

    removeMedia: function (mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: removeMedia: ${JSON.stringify(mdata, null, 4)}`
        );
      }
      this.$socketio.removeMedia(mdata);
    },
    editMedia: function (mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`);
      }
      this.$socketio.editMedia(mdata);
    },
    editMedia: function (mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`);
      }
      this.$socketio.editMedia(mdata);
    },

    openFolder: function (slugFolderName) {
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
        !this.canSeeFolder({
          type: "folders",
          slugFolderName,
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
          slugFolderName,
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
    closeFolder: function () {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: closeFolder");
      }
      this.settings.current_slugFolderName = "";
      history.pushState({ slugFolderName: "" }, "", "/");
    },
    updateFolderScale: function (slugFolderName, timelineViewport_scale) {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: updateFolderScale");
      }

      let viewportScale = localstore.get("viewport_scale") || {};
      viewportScale[slugFolderName] = timelineViewport_scale;

      localstore.set("viewport_scale", viewportScale);
    },
    getFolderScale: function (slugFolderName) {
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

    updateLocalLang: function (newLangCode) {
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

    updateFolderScrollLeft: function (
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
    getScrollLeft: function (slugFolderName) {
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
    updateKeyboardShortcuts: function (keyboard_shortcuts) {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: updateKeyboardShortcuts");
      }
      localstore.set("keyboard_shortcuts", keyboard_shortcuts);
      this.settings.keyboard_shortcuts = keyboard_shortcuts;
    },
    getKeyboardShortcuts: function () {
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
    getFolderPassword({ type, slugFolderName }) {
      const folders_password = this.$auth.getFoldersPasswords();
      if (
        folders_password.hasOwnProperty(type) &&
        folders_password[type].hasOwnProperty(slugFolderName)
      ) {
        return folders_password[type][slugFolderName];
      }
      return "";
    },
    mediaFirstAuthor(media, folder) {
      if (!media.hasOwnProperty("authors") || !Array.isArray(media.authors)) {
        return false;
      }

      const first_media_author = media.authors.find(
        (a) => a.hasOwnProperty("name") && !!a.name
      );

      if (
        !first_media_author ||
        !Array.isArray(folder.authors) ||
        folder.authors.length === 0
      )
        return false;

      const full_authors_info = folder.authors.filter(
        (a) => a.name === first_media_author.name
      );
      if (full_authors_info.length == 0) {
        return false;
      }

      return full_authors_info[0];
    },
    canEditFolder: function ({ type, slugFolderName }) {
      if (!this.store[type].hasOwnProperty(slugFolderName)) return false;

      const folder = this.store[type][slugFolderName];

      // if admin
      if (this.current_author_is_admin) return true;

      if (
        folder.hasOwnProperty("editing_limited_to") &&
        folder.editing_limited_to === "nobody"
      )
        return false;

      // if no password && no editing limits
      if (
        folder.password !== "has_pass" &&
        (!folder.hasOwnProperty("editing_limited_to") ||
          folder.editing_limited_to === "" ||
          folder.editing_limited_to === "with_password")
      )
        return true;

      // if explicit edit authorized
      if (
        folder.hasOwnProperty("editing_limited_to") &&
        folder.editing_limited_to === "everybody"
      )
        return true;

      // if password is set
      if (
        folder.password === "has_pass" &&
        (!folder.hasOwnProperty("editing_limited_to") ||
          folder.editing_limited_to === "" ||
          folder.editing_limited_to === "with_password")
      ) {
        return this.state.list_authorized_folders.some((i) => {
          return (
            !!i &&
            i.hasOwnProperty("type") &&
            i.type === type &&
            i.hasOwnProperty("allowed_slugFolderNames") &&
            i.allowed_slugFolderNames.indexOf(slugFolderName) >= 0
          );
        });
      }

      // if editing_limited_to === 'only_authors'
      if (
        folder.hasOwnProperty("editing_limited_to") &&
        folder.editing_limited_to === "only_authors"
      ) {
        if (!folder.authors || folder.authors.length === 0) return true;

        return folder.authors.some(
          (a) => a.slugFolderName === this.current_author.slugFolderName
        );
      }

      return false;
    },
    canSeeFolder: function ({ type, slugFolderName }) {
      if (!this.store[type].hasOwnProperty(slugFolderName)) return false;

      // if folder has pass, and user doesn’t have it
      const folder = this.store[type][slugFolderName];

      if (
        folder.hasOwnProperty("viewing_limited_to") &&
        folder.viewing_limited_to === "everybody"
      ) {
        return true;
      }

      return this.canEditFolder({ type, slugFolderName });
    },
  },
  watch: {
    "settings.has_modal_opened": function () {
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
    },
    "current_time.seconds": function () {
      if (
        !this.current_time.minutes ||
        !this.current_time.minutes.isSame(this.current_time.seconds, "minute")
      ) {
        this.current_time.minutes = this.current_time.seconds.startOf("minute");

        if (
          !this.current_time.days ||
          !this.current_time.days.isSame(this.current_time.seconds, "day")
        ) {
          this.current_time.days = this.current_time.seconds.startOf("day");
        }
      }
    },
  },
  computed: {
    currentFolder: function () {
      if (
        this.store.hasOwnProperty("folders") &&
        this.store.folders.hasOwnProperty(this.settings.current_slugFolderName)
      ) {
        return this.store.folders[this.settings.current_slugFolderName];
      }
      return {};
    },
    currentTime_human() {
      return this.$moment(this.current_time.seconds).format("l LTS");
    },
    current_chat() {
      if (!this.settings.current_chat_slug) return false;

      return Object.values(this.store.chats).find(
        (c) => c.slugFolderName === this.settings.current_chat_slug
      );
    },
    allKeywords() {
      if (Object.keys(this.currentFolder).length === 0) {
        return [];
      }

      let allKeywords = [];

      if (
        this.currentFolder.hasOwnProperty("medias") &&
        Object.keys(this.currentFolder.medias).length > 0
      ) {
        Object.values(this.currentFolder.medias).map((m) => {
          if (
            m.hasOwnProperty("keywords") &&
            typeof m.keywords === "object" &&
            m.keywords.length > 0
          ) {
            allKeywords = allKeywords.concat(m.keywords.map((k) => k.title));
          }
        });

        allKeywords = allKeywords.filter(function (item, pos) {
          return allKeywords.indexOf(item) == pos;
        });

        return allKeywords.map((kw) => {
          return {
            text: kw,
            classes: "tagcolorid_" + (parseInt(kw, 36) % 2),
          };
        });
      }
      return [];
    },
  },
});
