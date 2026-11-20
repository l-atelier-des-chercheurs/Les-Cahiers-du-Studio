<template>
  <div class="app">
    <RouterView v-slot="{ Component }">
      <component
        :is="Component"
        @login="show_login_modal = true"
        @notice="show_notice = true"
      />
    </RouterView>

    <LoginModal v-if="show_login_modal" @close="show_login_modal = false" />

    <NoticeModal v-if="show_notice" @close="show_notice = false" />

    <AppNotifications />

    <UpdateNotice />
  </div>
</template>

<script>
import AppNotifications from "@/components/AppNotifications.vue";
import LoginModal from "@/components/LoginModal.vue";
import NoticeModal from "@/components/NoticeModal.vue";
import UpdateNotice from "@/components/UpdateNotice.vue";

export default {
  components: { AppNotifications, LoginModal, NoticeModal, UpdateNotice },
  data() {
    return {
      show_login_modal: false,
      // the app is not open yet: say so on every visit
      show_notice: true,
    };
  },
};
</script>
