<template>
  <div class="m_chatsview">
    <div class="m_chatsview--topbar">
      <div class="m_actionbar">
        <div class="m_actionbar--buttonBar"></div>
        <div class="m_actionbar--text">{{ $t("channels_instructions") }}</div>
      </div>

      <button
        class="button-round _closeChatButton padding-verysmall"
        @click="$root.closeChatPane()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 48 48"
        >
          <line x1="13.33" y1="13.33" x2="34.67" y2="34.67" />
          <line x1="13.33" y1="34.67" x2="34.67" y2="13.33" />
        </svg>
      </button>
    </div>

    <div class="m_channels">
      <div class="m_channels--content">
        <h3 class="font-folder_title">{{ $t("channels_list") }}</h3>
        <div class="margin-vert-small">
          <template v-if="$root.current_author">
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
              >
                {{ $t("login_to_create_channel") }}
              </button>
            </div>
          </template>
        </div>

        <label>{{ $t("pinned") }}</label>
        <div class="m_chats--list">
          <ChatRow
            v-for="(chat, index) in filtered_chats"
            :key="index"
            :chat="chat"
          />
        </div>
      </div>
    </div>

    <transition name="chatopen">
      <Chat
        v-if="$root.current_chat"
        :key="$root.current_chat.slugFolderName"
        :chat="$root.current_chat"
      />
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
  },
  components: {
    CreateChat,
    ChatRow,
    Chat,
  },
  data() {
    return {
      show_create_channel_modal: false,
      new_channel_name: "",
    };
  },
  created() {},
  mounted() {
    if (this.$root.state.mode === "export_web") return;

    this.$socketio.listFolders({ type: "chats" });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    filtered_chats() {
      return Object.values(this.$root.store.chats).filter(
        (c) => c.attached_to_folder === this.$root.current_folder.slugFolderName
      );
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.m_chatsview {
  position: relative;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  // width: 100%;
  // height: 100%;

  // z-index: 100000;
  // top: 0;
  // right: 0;
  // max-width: 440px;
  // flex: 0 0 420px;

  height: 100%;
  background-color: #ffd9eb;
  // border: 4px solid #ffaad2;
  color: white;
  // box-shadow: -0.1em 0.2em 1em rgba(0, 0, 0, 0.2);

  // background-color: white;
  // margin: 2em;
  // padding: 1em;
  padding-top: calc(var(--spacing) / 2);
  padding-bottom: calc(var(--spacing) / 2);

  // border-radius: 8px;

  display: flex;
  flex-flow: column nowrap;

  button,
  label {
    color: #f50000;
  }
}

._closeChatButton {
  flex: 0 0 auto;
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 0;
  width: 33px;
  height: 33px;

  svg {
    display: block;
    width: 33px;
    height: 33px;
    stroke: white;
  }
}

.m_chatsview--topbar {
  padding-left: calc(var(--spacing) / 4);
  padding-right: calc(var(--spacing) / 4);
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}
</style>
