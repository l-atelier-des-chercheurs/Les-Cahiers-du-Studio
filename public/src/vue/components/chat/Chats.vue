<template>
  <div class="m_chatsview">
    <div class="m_actionbar">
      <div class="m_actionbar--buttonBar"></div>
      <div class="m_actionbar--text">{{ $t("channels_instructions") }}</div>
    </div>

    <div class="m_channels">
      <div class="m_channels--content">
        <h3 class="font-folder_title">{{ $t("channels_list") }}</h3>
        <div class="margin-vert-small">
          <template v-if="current_author">
            <button
              type="button"
              class="barButton barButton_createChannel"
              @click="show_create_channel_modal = !show_create_channel_modal"
            >
              <span>{{ $t("create") }}</span>
            </button>

            <CreateChat
              v-if="show_create_channel_modal"
              @close="show_create_channel_modal = false"
            />
          </template>
          <template v-else>
            <div>
              <button
                type="button"
                class="button-thin bg-bleumarine margin-left-none"
                @click="$root.showAuthorsListModal = true"
              >{{ $t("login_to_create_channel") }}</button>
            </div>
          </template>
        </div>

        <label>{{ $t("pinned") }}</label>
        <div class="m_chats--list">
          <ChatRow v-for="(chat, index) in chats" :key="index" :chat="chat" />
        </div>
      </div>
    </div>

    <transition name="slideright" :duration="500">
      <Chat :chat="$root.current_chat" v-if="$root.current_chat" />
    </transition>
  </div>
</template>
<script>
import CreateChat from "../modals/CreateChat.vue";
import ChatRow from "./ChatRow.vue";
import Chat from "./Chat.vue";

export default {
  props: {
    read_only: Boolean,
    chats: Object,
    current_author: String
  },
  components: {
    CreateChat,
    ChatRow,
    Chat
  },
  data() {
    return {
      show_create_channel_modal: false,
      new_channel_name: ""
    };
  },
  created() {},
  mounted() {
    this.$socketio.listFolders({ type: "chats" });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {}
};
</script>
<style lang="scss" scoped>
.m_chatsview {
  position: absolute;
  z-index: 100000;
  top: 0;
  right: 0;
  max-width: 400px;
  height: calc(100% - 4em);
  background-color: var(--color-noir);
  color: white;
  box-shadow: -0.1em 0.2em 1em rgba(0, 0, 0, 0.2);

  // background-color: white;
  border: 4px solid var(--color-noir);
  margin: 2em;
  padding: 1em;
  border-radius: 8px;

  button,
  label {
    color: var(--color-noir) !important;
  }
}
</style>
