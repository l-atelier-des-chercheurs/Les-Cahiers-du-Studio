<template>
  <div class="app">
    <RouterView v-slot="{ Component }">
      <component
        :is="Component"
        @login="show_login_modal = true"
        @feedback="feedback_tab = 'feedback'"
      />
    </RouterView>

    <LoginModal v-if="show_login_modal" @close="show_login_modal = false" />

    <FeedbackPanel
      v-if="feedback_tab"
      :initial_tab="feedback_tab"
      @close="feedback_tab = ''"
    />

    <AppNotifications />

    <UpdateNotice />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { readJSON, writeJSON } from "@/adc/storage";
import AppNotifications from "@/components/AppNotifications.vue";
import LoginModal from "@/components/LoginModal.vue";
import UpdateNotice from "@/components/UpdateNotice.vue";

const WELCOMED_KEY = "cahiers.welcomed";

export default {
  components: {
    AppNotifications,
    LoginModal,
    UpdateNotice,
    FeedbackPanel: defineAsyncComponent(
      () => import("@/components/FeedbackPanel.vue")
    ),
  },
  data() {
    return {
      show_login_modal: false,
      // the "Vos retours" panel open, on this tab
      feedback_tab: "",
    };
  },
  // a first visit: the app is a prototype, said once, on the panel's
  // "about" tab (it was said on every visit)
  created() {
    if (readJSON(WELCOMED_KEY)) return;
    writeJSON(WELCOMED_KEY, true);
    if (!window.app_infos?.page_is_standalone_html) this.feedback_tab = "about";
  },
};
</script>
