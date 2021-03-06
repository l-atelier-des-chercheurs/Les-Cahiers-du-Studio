<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="false"
    :isFile="true"
  >
    <!-- @submit="uploadFiles" -->
    <template slot="header">
      <span class>{{ $t("import_medias") }}</span>
    </template>

    <template slot="sidebar">
      <transition-group tag="div" name="fileupload_list">
        <div
          v-for="(f, index) in files_to_upload"
          :key="f.name"
          class="m_uploadFile"
          :class="cssStatus(f)"
          :style="
            `--progress-percent: ${
              files_to_upload_meta.hasOwnProperty(f.name)
                ? files_to_upload_meta[f.name].upload_percentages / 100
                : 0
            }`
          "
        >
          <!-- too heavy on memory on mobile devices -->
          <img
            v-if="!!f.type && f.type.includes('image') && index < 5"
            class="m_uploadFile--image"
            :src="getImgPreview(f)"
          />
          <div v-else class="m_uploadFile--image" />

          <div :title="f.name" class="m_uploadFile--filename">{{ f.name }}</div>
          <div class="m_uploadFile--size">{{ formatBytes(f.size) }}</div>
          <div
            class="m_uploadFile--action"
            v-if="files_to_upload_meta.hasOwnProperty(f.name)"
          >
            <button
              type="button"
              class="buttonLink"
              @click="sendThisFile(f)"
              :disabled="
                read_only ||
                  (files_to_upload_meta.hasOwnProperty(f.name) &&
                    files_to_upload_meta[f.name].status === 'success')
              "
            >
              <template v-if="!files_to_upload_meta.hasOwnProperty(f.name)">{{
                $t("import")
              }}</template>
              <template
                v-else-if="files_to_upload_meta[f.name].status === 'success'"
                >{{ $t("sent") }}</template
              >
              <template
                v-else-if="files_to_upload_meta[f.name].status === 'failed'"
                >{{ $t("retry") }}</template
              >
            </button>
          </div>
        </div>
      </transition-group>
    </template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import * as axios from "axios";
import { setTimeout } from "timers";
import UAparser from "ua-parser-js";

export default {
  props: {
    read_only: Boolean,
    slugFolderName: String,
    type: String,
    selected_files: Array
  },
  components: {
    Modal
  },
  data() {
    return {
      files_to_upload: this.selected_files,
      files_to_upload_meta: {},
      upload_percentages: 0
    };
  },
  watch: {},
  mounted() {
    console.log("MOUNTED • TimeLineView: onScroll");
    this.sendAllFiles();
  },
  beforeDestroy() {},
  computed: {
    uriToUploadMedia: function() {
      return `file-upload/${this.type}/${this.slugFolderName}`;
    }
  },
  methods: {
    sendThisFile(f) {
      return new Promise((resolve, reject) => {
        if (this.$root.state.dev_mode === "debug") {
          console.log(`METHODS • UploadFile / sendThisFile : name = ${f.name}`);
        }

        const filename = f.name;
        const modified = f.lastModified;

        this.$set(this.files_to_upload_meta, filename, {
          upload_percentages: 0,
          status: "sending"
        });

        let formData = new FormData();
        formData.append("files", f, filename);

        let meta = {
          fileCreationDate: modified,
          setDateTimelineToDateCreated: this.$root.settings
            .setDateTimelineToDateCreated,
          authors: this.$root.settings.current_author_name
            ? [{ name: this.$root.settings.current_author_name }]
            : "",
          w: 4,
          h: 3
        };

        const parser = new UAparser();
        const result = parser.getResult();
        if (result) {
          meta.device_infos = [];
          const browser = Object.assign(result.browser, { type: "browser" });
          const device = Object.assign(result.device, { type: "device" });
          const os = Object.assign(result.os, { type: "os" });
          meta.device_infos.push(browser, device, os);
        }

        formData.append(filename, JSON.stringify(meta));

        const socketid = this.$socketio.socket.id;
        if (socketid !== undefined) {
          formData.append("socketid", socketid);
        }

        if (this.$root.state.dev_mode === "debug") {
          console.log(
            `METHODS • sendThisFile: name = ${filename} / formData is ready / sending to ${this.uriToUploadMedia}`
          );
        }

        // TODO : possibilité de cancel
        axios
          .post(this.uriToUploadMedia, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: function(progressEvent) {
              this.files_to_upload_meta[filename].upload_percentages = parseInt(
                Math.round((progressEvent.loaded * 100) / progressEvent.total)
              );
            }.bind(this)
          })
          .then(x => x.data)
          .then(x => {
            if (this.$root.state.dev_mode === "debug") {
              console.log(
                `METHODS • sendThisFile: name = ${filename} / success uploading`
              );
            }

            this.files_to_upload_meta[filename].status = "success";
            this.files_to_upload_meta[filename].upload_percentages = 100;

            resolve();
            // resolve(x.map(img => Object.assign({}, img, { url: `${BASE_URL}/images/${img.id}` })));
          })
          .catch(err => {
            if (this.$root.state.dev_mode === "debug") {
              console.log(
                `METHODS • sendThisFile: name = ${filename} / failed uploading`
              );
            }

            this.files_to_upload_meta[filename].status = "failed";
            this.files_to_upload_meta[filename].upload_percentages = 0;
            reject();
          });
      });
    },
    sendAllFiles() {
      const executeSequentially = array => {
        return this.sendThisFile(this.files_to_upload[array.shift()]).then(x =>
          array.length == 0 ? x : executeSequentially(array)
        );
      };

      executeSequentially(
        Array.from(Array(this.files_to_upload.length).keys())
      ).then(x => {
        Object.keys(this.files_to_upload_meta).map(name => {
          let index = 1;
          if (this.files_to_upload_meta[name].status === "success") {
            setTimeout(() => {
              this.files_to_upload = this.files_to_upload.filter(
                x => x.name !== name
              );
              this.$delete(this.files_to_upload_meta, name);

              // check if there are anymore files to upload
              if (Object.keys(this.files_to_upload_meta).length === 0) {
                this.$eventHub.$emit("timeline.scrollToEnd");
                this.$emit("close");
              }
            }, 500 * index);
            index++;
          }
        });
      });

      // const test = async () => {
      //   for (let task of Array.from(Array(this.files_to_upload.length).keys()).map()) {
      //     await sendThisFile(task);
      //   }
      // }
    },
    formatBytes(a, b) {
      if (0 == a) return `0 ${this.$t("bytes")}`;

      var e = [
        this.$t("bytes"),
        this.$t("kb"),
        this.$t("mb"),
        this.$t("gb"),
        "TB",
        "PB",
        "EB",
        "ZB",
        "YB"
      ];

      var c = 1024,
        d = b || 2,
        f = Math.floor(Math.log(a) / Math.log(c));
      return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
    },
    getImgPreview(file) {
      return URL.createObjectURL(file);
    },
    cssStatus(f) {
      if (this.files_to_upload_meta.hasOwnProperty(f.name)) {
        return "is--" + this.files_to_upload_meta[f.name].status;
      }
    }
  }
};
</script>
<style></style>
