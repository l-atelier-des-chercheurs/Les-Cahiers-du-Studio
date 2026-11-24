<template>
  <BaseModal
    :disabled="!can_submit"
    :busy="is_submitting"
    @close="$emit('close')"
    @submit="submit"
  >
    <template #header>
      {{ mode === "signup" ? $t("create_account") : $t("login") }}
    </template>

    <!-- LOGIN -->
    <template v-if="mode === 'login'">
      <p v-if="!authors && !error" class="m_modal--field font-small">
        {{ $t("loading") }}
      </p>
      <template v-else-if="authors">
        <div class="m_modal--field">
          <label for="login_author">{{ $t("author") }}</label>
          <select id="login_author" v-model="path_to_author" required>
            <option value="" disabled>{{ $t("choose_author") }}</option>
            <option
              v-for="author in authors"
              :key="author.$path"
              :value="author.$path"
            >
              {{ author.name || author.$path.split("/").pop() }}
            </option>
          </select>
        </div>

        <div class="m_modal--field">
          <label for="login_password">{{ $t("password") }}</label>
          <input
            id="login_password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>
      </template>

      <p class="m_modal--field">
        <small>
          {{ $t("no_account_yet") }}
          <button type="button" class="textLink" @click="setMode('signup')">
            {{ $t("create_account") }}
          </button>
        </small>
      </p>
    </template>

    <!-- SIGNUP: the instance's invitation code first, when it has one -->
    <template v-else>
      <div v-if="has_signup_password" class="m_modal--field">
        <label for="signup_code">{{ $t("signup_code") }}</label>
        <input
          id="signup_code"
          v-model="signup_code"
          type="password"
          autocomplete="off"
          required
        />
        <small>{{ $t("signup_code_instructions") }}</small>
      </div>

      <div class="m_modal--field">
        <label for="signup_name">{{ $t("name") }}</label>
        <input
          id="signup_name"
          v-model.trim="name"
          type="text"
          autocomplete="name"
          maxlength="100"
          required
        />
        <small>{{ $t("signup_name_instructions") }}</small>
      </div>

      <div class="m_modal--field">
        <label for="signup_email">
          {{ $t("email") }}
          <template v-if="!is_email_required">
            {{ $t("optional") }}
          </template>
        </label>
        <input
          id="signup_email"
          v-model.trim="email"
          type="email"
          autocomplete="email"
          :required="is_email_required"
        />
        <small>{{ $t("signup_email_instructions") }}</small>
      </div>

      <div class="m_modal--field">
        <label for="signup_password">{{ $t("password") }}</label>
        <input
          id="signup_password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          :minlength="MIN_PASSWORD_LENGTH"
          required
        />
        <small>
          {{ $t("password_min_length", { n: MIN_PASSWORD_LENGTH }) }}
        </small>
      </div>

      <div class="m_modal--field">
        <label for="signup_password_confirm">
          {{ $t("password_confirm") }}
        </label>
        <input
          id="signup_password_confirm"
          v-model="password_confirm"
          type="password"
          autocomplete="new-password"
          required
        />
        <small
          v-if="password_confirm && password_confirm !== password"
          class="m_login--mismatch"
        >
          {{ $t("passwords_differ") }}
        </small>
      </div>

      <p class="m_modal--field">
        <small>
          {{ $t("already_an_account") }}
          <button type="button" class="textLink" @click="setMode('login')">
            {{ $t("login") }}
          </button>
        </small>
      </p>
    </template>

    <p v-if="error" class="m_modal--field form-error">{{ error }}</p>

    <template #submit_button>
      {{ mode === "signup" ? $t("create_account") : $t("login") }}
    </template>
  </BaseModal>
</template>

<script>
import { mapActions } from "pinia";
import * as api from "@/adc/api";
import { useSessionStore } from "@/stores/session";
import BaseModal from "./BaseModal.vue";

const MIN_PASSWORD_LENGTH = 6;

// adc-core's utils.hashCode: the instance sends its signup password hashed
// this way (instance_meta.signup_password_hashed)
// TODO adc-core: check it on the server instead (adc-core/TODO.md, "Signup
// password checked on the server"); until then, it is only checked here
function hashCode(s) {
  return (
    "" +
    s.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0)
  );
}

export default {
  components: { BaseModal },
  emits: ["close"],
  data() {
    return {
      MIN_PASSWORD_LENGTH,
      mode: "login",
      authors: undefined,
      path_to_author: "",
      password: "",
      // signup
      signup_code: "",
      name: "",
      email: "",
      password_confirm: "",
      is_submitting: false,
      error: "",
    };
  },
  computed: {
    instance_meta() {
      return window.app_infos?.instance_meta ?? {};
    },
    has_signup_password() {
      return !!this.instance_meta.signup_password_hashed;
    },
    is_email_required() {
      return this.instance_meta.require_mail_to_signup === true;
    },
    can_submit() {
      if (this.is_submitting) return false;
      if (this.mode === "login")
        return !!this.path_to_author && !!this.password;
      return (
        (!this.has_signup_password || !!this.signup_code) &&
        !!this.name &&
        (!this.is_email_required || !!this.email) &&
        this.password.length >= MIN_PASSWORD_LENGTH &&
        this.password === this.password_confirm
      );
    },
  },
  created() {
    this.loadAuthors();
  },
  methods: {
    ...mapActions(useSessionStore, ["login"]),
    async loadAuthors() {
      try {
        const authors = await api.getFolders("authors");
        this.authors = authors.sort((a, b) =>
          String(a.name ?? a.$path).localeCompare(String(b.name ?? b.$path))
        );
      } catch (err) {
        this.error = this.$t("error_with_code", {
          code: err.code || err.message,
        });
      }
    },
    setMode(mode) {
      this.mode = mode;
      this.error = "";
      this.password = "";
      this.password_confirm = "";
    },
    submit() {
      if (!this.can_submit) return;
      return this.mode === "signup" ? this.signup() : this.loginAs();
    },
    async loginAs() {
      this.is_submitting = true;
      this.error = "";
      try {
        await this.login(this.path_to_author, this.password);
        this.$emit("close");
      } catch (err) {
        this.error = [401, 403].includes(err.status)
          ? this.$t("wrong_password")
          : this.$t("error_with_code", { code: err.code || err.message });
      } finally {
        this.is_submitting = false;
      }
    },
    // creates the account, then logs in with it
    async signup() {
      this.error = "";
      if (
        this.has_signup_password &&
        hashCode(this.signup_code) !== this.instance_meta.signup_password_hashed
      )
        return (this.error = this.$t("wrong_signup_code"));

      this.is_submitting = true;
      try {
        const path_to_author = await api.createFolder("authors", {
          name: this.name,
          requested_slug: this.name,
          // unique: compared as written, so always in lower case
          ...(this.email && { email: this.email.toLowerCase() }),
          // adc-core makes folders private when $status is missing
          $status: "public",
          $password: this.password,
        });
        await this.login(path_to_author, this.password);
        this.$emit("close");
      } catch (err) {
        if (err.code === "unique_field_taken")
          this.error =
            err.err_infos === "email"
              ? this.$t("email_taken")
              : this.$t("name_taken");
        else
          this.error = this.$t("error_with_code", {
            code: err.code || err.message,
          });
      } finally {
        this.is_submitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.m_modal--field small.m_login--mismatch {
  color: #ff7e8a;
}
</style>
