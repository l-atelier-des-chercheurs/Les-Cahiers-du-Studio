<template>
  <div
    class="mediaTextContent quillWrapper"
    autofocus="autofocus"
    :autocorrect="spellcheckIsEnabled"
    :spellcheck="spellcheckIsEnabled"
  >
    <!-- <template v-if="enable_collaboration">
      connection_state : {{ connection_state }}<br>
    </template>-->
    <div ref="editor" />
  </div>
</template>
<script>
import ReconnectingWebSocket from "reconnectingwebsocket";
import ShareDB from "sharedb/lib/client";
import Quill from "quill";

ShareDB.types.register(require("rich-text").type);

export default {
  props: {
    value: {
      type: String,
      default: "…",
    },
    media_metaFileName: String,
    slugFolderName: String,
    enable_collaboration: {
      type: Boolean,
      default: false,
    },
    read_only: {
      type: Boolean,
      default: true,
    },
  },
  components: {},
  data() {
    return {
      editor: null,
      editor_id: (Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 5
      ),

      custom_toolbar: [
        [{ header: [false, 1, 2] }],
        ["italic", "underline", "link", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
      ],

      socket: null,
      connection_state: undefined,
      requested_resource_url: undefined,
    };
  },

  created() {},
  mounted() {
    console.log(`MOUNTED • CollaborativeEditor`);

    this.editor = new Quill(this.$refs.editor, {
      modules: {
        toolbar: this.custom_toolbar,
      },
      bounds: this.$refs.editor,

      theme: "snow",
      formats: ["italic", "underline", "link", "header", "list"],
    });

    this.editor.root.innerHTML = this.value;

    if (this.$root.state.mode === "export_web") {
      this.editor.disable();
    }

    this.$nextTick(() => {
      if (this.enable_collaboration) {
        // set connection to sharedb / wss
        // so sharedb will send last version of that medias’ content
        this.initWebsocketMode();
      }

      this.editor.on("text-change", (delta, oldDelta, source) => {
        this.$emit(
          "input",
          this.editor.getText() ? this.editor.root.innerHTML : ""
        );
      });
    });
  },
  beforeDestroy() {
    if (!!this.socket) {
      this.socket.close();
    }
  },
  watch: {
    read_only: function () {
      if (!this.read_only) {
        this.editor.enable();
      } else {
        this.editor.disable();
      }
    },
  },
  computed: {
    spellcheckIsEnabled() {
      return !(this.$root.state.mode === "export_web");
    },
  },
  methods: {
    initWebsocketMode() {
      const params = new URLSearchParams({
        type: "folders",
        slugFolderName: this.slugFolderName,
        metaFileName: this.media_metaFileName,
      });

      const requested_querystring = "?" + params.toString();
      this.requested_resource_url =
        (location.protocol === "https:" ? "wss" : "ws") +
        "://" +
        window.location.host +
        "/sharedb" +
        requested_querystring;

      console.log(
        `METHODS • CollaborativeEditor: initWebsocketMode for ${this.requested_resource_url}`
      );

      this.socket = new ReconnectingWebSocket(this.requested_resource_url);
      const connection = new ShareDB.Connection(this.socket);
      connection.on("state", this.wsState);

      const doc = connection.get("writeup", requested_querystring);

      doc.subscribe((err) => {
        if (err) {
          console.error(`ON • CollaborativeEditor: err ${err}`);
          return;
        }
        console.log(`ON • CollaborativeEditor: subscribe`);

        if (!doc.type) {
          console.log(
            `ON • CollaborativeEditor: no type found on doc, creating a new one with content ${JSON.stringify(
              this.editor.getContents()
            )}`
          );
          doc.create(this.editor.getContents(), "rich-text");
        } else {
          console.log(
            `ON • CollaborativeEditor: doc already exists and doc.data = ${JSON.stringify(
              doc.data,
              null,
              4
            )}`
          );
          this.editor.setContents(doc.data);
          this.$emit(
            "input",
            this.editor.getText() ? this.editor.root.innerHTML : ""
          );
        }

        this.editor.on("text-change", (delta, oldDelta, source) => {
          if (source == "user") {
            console.log(`ON • CollaborativeEditor: text-change by user`);
            doc.submitOp(delta, { source: this.editor_id });
          } else {
            console.log(`ON • CollaborativeEditor: text-change by API`);
          }
        });

        doc.on("op", (op, source) => {
          if (source === this.editor_id) return;
          console.log(`ON • CollaborativeEditor: operation applied to quill`);
          this.editor.updateContents(op);
        });
      });
    },
    wsState(state, reason) {
      console.log(
        `METHODS • CollaborativeEditor: wsState with state = ${state} and reason = ${reason}`
      );
      this.connection_state = state.toString();
      this.$emit("connectionStateChanged", this.connection_state);

      if (this.connection_state === "connected") {
        this.editor.enable(true); // Disables user input
      } else {
        this.editor.enable(false); // Disables user input
      }
      // 'connecting' 'connected' 'disconnected' 'closed' 'stopped'
    },
  },
};
</script>
<style></style>
