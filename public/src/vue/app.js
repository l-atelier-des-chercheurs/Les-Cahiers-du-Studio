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

import Modal from "./components/modals/BaseModal.vue";
Vue.component("Modal", Modal);
import DateFieldComponent from "./components/subcomponents/DateField.vue";
Vue.component("DateField", DateFieldComponent);
import PasswordFieldComponent from "./components/subcomponents/PasswordField.vue";
Vue.component("PasswordField", PasswordFieldComponent);

Vue.component("Loader", {
  name: "Loader",
  template: `
    <div class="_loader">
      <span class="loader" />
    </div>
  `,
});

import VueTippy, { TippyComponent } from "vue-tippy";
Vue.use(VueTippy);
Vue.component("tippy", TippyComponent);

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

    showAuthorsListModal: false,

    settings: {
      has_modal_opened: false,
      has_writeup_opended: false,
      current_slugFolderName: "",
      has_sidebar_opened: false,
      sidebar_type: "",

      highlightMedia: "",
      enable_system_bar: window.state.is_electron && window.state.is_darwin,
      perf_mode: "low",

      keyboard_shortcuts: [],

      setDateTimelineToDateCreated: false,

      current_chat_slug: false,
      current_author_slug: false,

      media_keyword_filter: false,
      media_author_filter: false,

      folder_filter: {
        name: "",
      },

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

    if (this.state.mode === "export_web") {
      this.access = true;
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
        this.$eventHub.$once("socketio.folders.folders_listed", () => {
          this.openFolder(this.store.request.slugFolderName);
        });
        // requesting edit of a media
        if (this.store.request.metaFileName) {
          this.$eventHub.$once("socketio.folders.medias_listed", () => {
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
          //   this.$alertify
          //     .closeLogOnClick(true)
          //     .delay(4000)
          //     .success(this.$t('notifications["connected_to_lescahiers"]'));
        });
        this.$eventHub.$on("socketio.reconnect", () => {
          //   this.$alertify
          //     .closeLogOnClick(true)
          //     .delay(4000)
          //     .success(this.$t('notifications["connected_to_lescahiers"]'));
        });
      }

      this.$socketio.connect();

      this.$eventHub.$once("socketio.authentificated", () => {
        this.$socketio.listFolders({ type: "folders" });
        this.$socketio.listFolders({ type: "authors" });
        this.$socketio.listFolders({ type: "chats" });

        this.$eventHub.$once("socketio.folders.folders_listed", () => {
          if (this.store.folders.hasOwnProperty("puces-typo")) {
            if (this.store.request.slugFolderName === "les-puces-typo-11")
              this.openFolder("les-puces-typo-11");
          }
          this.access = true;
        });

        if (this.current_project) {
          this.$socketio.listMedias({
            type: "folders",
            slugFolderName: this.settings.current_slugFolderName,
          });
        }

        const authorized_authors = this.state.list_authorized_folders.find(
          (f) => f.type === "authors" && f.allowed_slugFolderNames.length > 0
        );

        if (authorized_authors) {
          this.$eventHub.$once("socketio.authors.folders_listed", () => {
            if (Object.values(this.store.authors).length === 0) return;

            const first_author_slug =
              authorized_authors.allowed_slugFolderNames[0];
            const author = Object.values(this.store.authors).find(
              (a) => a.slugFolderName === first_author_slug
            );

            if (author) {
              this.setAuthor(first_author_slug);
              this.$alertify
                .closeLogOnClick(true)
                .delay(4000)
                .success(
                  this.$t("notifications.connecting_using_saved_account") +
                    author.name
                );
            }
          });
        }
      });
    }
  },
  methods: {
    createFolder: function (fdata) {
      return new Promise((resolve, reject) => {
        if (window.state.dev_mode === "debug") {
          console.log(
            `ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`
          );
        }

        const type = fdata.type;

        fdata.id =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        this.$socketio.createFolder(fdata);

        const catchFolderCreation = (d) => {
          if (fdata.id === d.id) {
            if (d.password === "has_pass") {
              this.$auth.updateFoldersPasswords({
                [type]: {
                  [d.slugFolderName]: fdata.data.password,
                },
              });

              this.$socketio.sendAuth();
              this.$eventHub.$once("socketio.authentificated", () => {
                return resolve(d);
              });
            } else {
              this.$nextTick(() => {
                return resolve(d);
              });
            }
          } else {
            this.$eventHub.$once(
              `socketio.folder_created_or_updated`,
              catchFolderCreation
            );
          }
        };
        this.$eventHub.$once(
          `socketio.folder_created_or_updated`,
          catchFolderCreation
        );
      });
    },
    editFolder: function (fdata) {
      return new Promise((resolve, reject) => {
        if (window.state.dev_mode === "debug") {
          console.log(
            `ROOT EVENT: editFolder: ${JSON.stringify(fdata, null, 4)}`
          );
        }

        fdata.id =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        this.$socketio.editFolder(fdata);

        const catchFolderEdition = function (d) {
          if (fdata.id === d.id) {
            return resolve(d);
          } else {
            this.$eventHub.$once(
              `socketio.folder_created_or_updated`,
              catchFolderEdition
            );
          }
        };
        this.$eventHub.$once(
          "socketio.folder_created_or_updated",
          catchFolderEdition
        );
      });
    },
    removeFolder: function ({ type, slugFolderName }) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: removeFolder: slugFolderName = ${slugFolderName} of type = ${type}`
        );
      }
      this.$socketio.removeFolder({ type, slugFolderName });
    },

    formatDateToHuman(date) {
      return this.$moment(date, "YYYY-MM-DD HH:mm:ss").format("LL");
    },
    formatDateToCalendar(date) {
      return this.$moment(date, "YYYY-MM-DD HH:mm:ss").calendar();
    },
    formatDateToPrecise(date) {
      return this.$moment(date, "YYYY-MM-DD HH:mm:ss").format("LTS L");
    },
    formatDurationToMinuteHours(date) {
      return this.$moment.utc(date).format("mm:ss");
    },
    formatDurationToHoursMinutesSeconds(date) {
      return this.$moment.utc(date).format("HH:mm:ss");
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
      if (!this.settings.has_sidebar_opened)
        this.settings.has_sidebar_opened = true;
      this.settings.sidebar_type = "chats";
      this.settings.current_chat_slug = slugFolderName;
    },
    closeChat() {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: closeChat`);
      }
      this.settings.current_chat_slug = false;
    },

    getChannelFromMedia(media_meta_linked) {
      if (window.state.dev_mode === "debug")
        console.log(`ROOT EVENT: getChannelFromMedia: ${media_meta_linked}`);

      const linked_channel = Object.values(this.store.chats).find(
        (c) => c.is_linked_to_media === media_meta_linked
      );

      if (!linked_channel) return false;

      return linked_channel;
    },

    openOrCreateChatFromMedia(media_meta_linked) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: openOrCreateChatFromMedia: ${media_meta_linked}`
        );
      }

      if (!this.settings.show_chat_panel) this.settings.show_chat_panel = true;

      if (this.$root.settings.sidebar_type !== "chats")
        this.$root.settings.sidebar_type = "chats";
      this.$root.settings.has_sidebar_opened = true;

      if (!media_meta_linked) return;

      const linked_channel = Object.values(this.store.chats).find(
        (c) => c.is_linked_to_media === media_meta_linked
      );

      if (!linked_channel) {
        this.$root
          .createFolder({
            type: "chats",
            data: {
              attached_to_folder: this.current_folder.slugFolderName,
              is_linked_to_media: media_meta_linked,
              name: media_meta_linked,
            },
          })
          .then((cdata) => {
            this.$emit("close");
            this.$root.openChat(cdata.slugFolderName);
          });
      } else {
        this.$root.openChat(linked_channel.slugFolderName);
      }
    },
    closeChatPane() {
      if (window.state.dev_mode === "debug")
        console.log(`ROOT EVENT: closeChatPane`);
      this.closeChat();
      this.closeSidebar();
    },
    closeChat() {
      if (window.state.dev_mode === "debug")
        console.log(`ROOT EVENT: closeChat`);

      this.settings.current_chat_slug = false;
    },
    closeSidebar() {
      this.settings.has_sidebar_opened = false;
      this.settings.sidebar_type = "";
    },
    setAuthor: function (author_slug) {
      if (this.settings.current_author_slug === author_slug) return;

      if (this.state.dev_mode === "debug") console.log(`ROOT EVENT: setAuthor`);

      const author = Object.values(this.store.authors).find(
        (a) => a.slugFolderName === author_slug
      );

      if (!author) return;

      this.settings.current_author_slug = author_slug;

      // this.$socketio.socket.emit("updateClientInfo", {
      //   author: { slugFolderName: author.slugFolderName },
      // });
      this.$socketio.listFolders({ type: "authors" });
      this.$eventHub.$emit("authors.newAuthorSet");
    },
    unsetAuthor: function () {
      if (!this.settings.current_author_slug) return;

      if (this.state.dev_mode === "debug")
        console.log(`ROOT EVENT: unsetAuthor`);

      this.$auth.removeAllFoldersPassword({
        type: "authors",
      });
      this.$socketio.sendAuth();

      this.settings.current_author_slug = false;
      // this.$socketio.socket.emit("updateClientInfo", { author: {} });
    },
    updateClientInfo(val) {
      if (this.$socketio.socket) {
        if (window.state.dev_mode === "debug")
          console.log(`ROOT EVENT: updateClientInfo`);

        this.$socketio.socket.emit("updateClientInfo", val);
      }
    },

    createMedia: function (mdata) {
      return new Promise((resolve, reject) => {
        if (window.state.dev_mode === "debug") {
          console.log(`ROOT EVENT: createMedia`);
        }
        mdata.id =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        if (this.current_author) {
          if (!mdata.hasOwnProperty("additionalMeta")) {
            mdata.additionalMeta = {};
          }
          mdata.additionalMeta.authors = [
            { slugFolderName: this.current_author.slugFolderName },
          ];
        }

        this.$socketio.createMedia(mdata);

        const catchMediaCreation = (d) => {
          if (mdata.id === d.id) {
            this.$nextTick(() => {
              return resolve(d);
            });
          } else {
            this.$eventHub.$once(
              `socketio.media_created_or_updated`,
              catchMediaCreation
            );
          }
        };
        this.$eventHub.$once(
          `socketio.media_created_or_updated`,
          catchMediaCreation
        );
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
      return new Promise((resolve, reject) => {
        if (window.state.dev_mode === "debug") {
          console.log(
            `ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`
          );
        }

        mdata.id =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        this.$socketio.editMedia(mdata);

        const editMediaTimeout = setTimeout(() => {
          this.$eventHub.$off(
            `socketio.media_created_or_updated`,
            catchMediaCreation
          );
          return reject();
        }, 2000);

        const catchMediaCreation = (d) => {
          if (mdata.id === d.id) {
            clearTimeout(editMediaTimeout);
            this.$nextTick(() => {
              return resolve(d);
            });
          } else {
            this.$eventHub.$once(
              `socketio.media_created_or_updated`,
              catchMediaCreation
            );
          }
        };

        this.$eventHub.$once(
          `socketio.media_created_or_updated`,
          catchMediaCreation
        );
      });
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

      // history.pushState(
      //   { slugFolderName },
      //   this.store.folders[slugFolderName].name,
      //   "/" + slugFolderName
      // );
    },
    closeFolder: function () {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: closeFolder");
      }
      this.settings.current_slugFolderName = "";
      // history.pushState({ slugFolderName: "" }, "", "/");
    },
    updateFolderScale: function (slugFolderName, timelineViewport_scale) {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: updateFolderScale");
      }

      let viewportScale = localstore.get("viewport_scale") || {};
      viewportScale[slugFolderName] = timelineViewport_scale;

      localstore.set("viewport_scale", viewportScale);
    },
    getAuthor(slugFolderName) {
      return this.getFolder({ slugFolderName, type: "authors" });
    },
    getFolder({ slugFolderName, type }) {
      if (
        Object.keys(this.store[type]).length === 0 ||
        !this.store[type].hasOwnProperty(slugFolderName)
      )
        return false;
      return this.store[type][slugFolderName];
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
      if (
        !media.hasOwnProperty("authors") ||
        typeof media.authors !== "object" ||
        media.authors.length === 0
      )
        return false;

      const author_slug = media.authors[0].slugFolderName;
      if (author_slug) {
        const author = this.getAuthor(author_slug);
        if (author && author.color) {
          return author.color;
        }
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
        (a) => a.hasOwnProperty("slugFolderName") && !!a.slugFolderName
      );

      if (!first_media_author || this.all_authors.length === 0) return false;

      const first_author = this.all_authors.find(
        (a) => a.slugFolderName === first_media_author.slugFolderName
      );

      return first_author;
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
    "store.authors": function () {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: var has changed: store.authors`);
      }
      // check if, when store.authors refresh, the current_author_slug is still there
      // delog if not
      if (
        this.settings.current_author_slug !== false &&
        !this.store.authors.hasOwnProperty(this.settings.current_author_slug)
      ) {
        this.unsetAuthor();
      }
    },
    "state.list_authorized_folders": {
      handler() {
        const authors = this.state.list_authorized_folders.find(
          (f) => f.type === "authors"
        );
        if (authors) {
          const allowed_slugFolderNames = authors.allowed_slugFolderNames;
          if (allowed_slugFolderNames.length > 0) {
            this.setAuthor(allowed_slugFolderNames[0]);
            return;
          }
        }
        this.unsetAuthor();
      },
      deep: true,
    },
  },
  computed: {
    current_folder: function () {
      if (
        this.store.hasOwnProperty("folders") &&
        this.store.folders.hasOwnProperty(this.settings.current_slugFolderName)
      ) {
        return this.store.folders[this.settings.current_slugFolderName];
      }
      return {};
    },
    current_author_is_admin() {
      return this.current_author && this.current_author.role === "admin";
    },
    currentTime_human() {
      return this.$moment(this.current_time.seconds).format("l LTS");
    },
    all_authors() {
      return Object.values(this.store.authors);
    },
    current_chat() {
      if (
        !this.settings.current_chat_slug ||
        !this.settings.has_sidebar_opened ||
        this.settings.sidebar_type !== "chats"
      )
        return false;

      return Object.values(this.store.chats).find(
        (c) => c.slugFolderName === this.settings.current_chat_slug
      );
    },
    current_author() {
      if (!this.settings.current_author_slug) return false;
      if (!this.store.authors.hasOwnProperty(this.settings.current_author_slug))
        return false;
      return this.store.authors[this.settings.current_author_slug];
    },
    allKeywords() {
      if (Object.keys(this.current_folder).length === 0) {
        return [];
      }

      let allKeywords = [];

      if (
        this.current_folder.hasOwnProperty("medias") &&
        Object.keys(this.current_folder.medias).length > 0
      ) {
        Object.values(this.current_folder.medias).map((m) => {
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
