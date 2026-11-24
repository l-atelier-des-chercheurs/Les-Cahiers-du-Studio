<template>
  <BaseModal
    :disabled="!form.title || !form.admins.length"
    :busy="is_saving"
    @close="$emit('close')"
    @submit="save"
  >
    <template #header>{{ $t("cahier_settings") }}</template>

    <div class="m_modal--field">
      <label for="cahier_settings_title">{{ $t("title") }}</label>
      <input
        id="cahier_settings_title"
        v-model.trim="form.title"
        type="text"
        required
        maxlength="200"
      />
      <!-- the address stays: links already shared keep working -->
      <small>{{ $t("title_keeps_address", { slug }) }}</small>
    </div>

    <div class="m_modal--field">
      <label for="cahier_settings_description">{{ $t("description") }}</label>
      <textarea
        id="cahier_settings_description"
        v-model="form.description"
        rows="3"
      />
    </div>

    <div class="m_modal--field">
      <label>{{ $t("timeline_bounds") }}</label>
      <div class="m_modal--box m_cahierSettings--dates">
        <label for="cahier_settings_start">
          {{ $t("timeline_start") }}
          <input
            id="cahier_settings_start"
            v-model="form.start"
            type="date"
            :max="form.end || undefined"
          />
        </label>
        <label for="cahier_settings_end">
          {{ $t("timeline_end") }}
          <input
            id="cahier_settings_end"
            v-model="form.end"
            type="date"
            :min="form.start || undefined"
          />
        </label>
        <small>{{ $t("timeline_bounds_instructions") }}</small>
      </div>
    </div>

    <div class="m_modal--field">
      <label>{{ $t("manage_access") }}</label>
      <div class="m_modal--box">
        <label class="m_modal--check">
          <input
            v-model="form.is_private"
            type="checkbox"
            :disabled="form.is_open"
          />
          {{ $t("private") }}
        </label>
        <small>
          {{
            form.is_private && !form.is_open
              ? $t("private_instructions")
              : $t("public_instructions")
          }}
        </small>
      </div>
    </div>

    <div class="m_modal--field">
      <div class="m_modal--box">
        <label class="m_modal--check">
          <input v-model="form.is_open" type="checkbox" />
          {{ $t("open_contributions") }}
        </label>
        <small>{{ $t("open_contributions_instructions") }}</small>
      </div>
    </div>

    <!-- admins, then contributors: chosen among the accounts -->
    <div v-for="role in roles" :key="role" class="m_modal--field">
      <label :for="`cahier_settings_${role}`">{{ $t(role) }}</label>
      <small class="m_cahierSettings--hint">{{
        $t(`${role}_instructions`)
      }}</small>
      <p
        v-if="role === 'contributors' && form.is_open"
        class="m_cahierSettings--value"
      >
        {{ $t("contributors_everyone") }}
      </p>
      <template v-else>
        <ul v-if="form[role].length" class="m_cahierSettings--chips">
          <li v-for="path in form[role]" :key="path">
            <span
              class="m_cahierSettings--dot"
              :style="{ '--author-color': authorColor(path) }"
              aria-hidden="true"
            />
            {{ authorName(path) }}
            <!-- a cahier keeps at least one admin -->
            <button
              v-if="role !== 'admins' || form.admins.length > 1"
              type="button"
              :aria-label="$t('remove_item', { item: authorName(path) })"
              @click="form[role] = form[role].filter((p) => p !== path)"
            >
              ×
            </button>
          </li>
        </ul>
        <p v-else class="m_cahierSettings--value">—</p>
        <select
          v-if="addableAuthors(role).length"
          :id="`cahier_settings_${role}`"
          value=""
          @change="addAuthor(role, $event)"
        >
          <option value="" disabled>{{ $t("add_account") }}</option>
          <option
            v-for="author in addableAuthors(role)"
            :key="author.$path"
            :value="author.$path"
          >
            {{ author.name || author.$path.split("/").pop() }}
          </option>
        </select>
      </template>
    </div>

    <p v-if="loses_admin" class="m_modal--field form-error">
      {{ $t("you_will_lose_admin") }}
    </p>

    <div class="m_modal--field">
      <button
        type="button"
        class="m_cahierSettings--choice is--danger"
        :class="{ 'is--active': confirm_remove }"
        :aria-expanded="confirm_remove"
        @click="confirm_remove = !confirm_remove"
      >
        {{ $t("remove_cahier") }}
      </button>
    </div>
    <div v-if="confirm_remove" class="m_modal--field m_cahierSettings--confirm">
      <p>{{ $t("sure_to_remove_cahier", { title: cahier.title || slug }) }}</p>
      <button
        type="button"
        class="m_cahierSettings--choice"
        @click="confirm_remove = false"
      >
        {{ $t("cancel") }}
      </button>
      <button
        type="button"
        class="m_cahierSettings--choice is--danger is--active"
        :disabled="is_saving"
        @click="remove"
      >
        {{ $t("remove") }}
      </button>
    </div>

    <p v-if="error" class="m_modal--field form-error">{{ error }}</p>

    <template #submit_button>{{ $t("save") }}</template>
  </BaseModal>
</template>

<script>
import { mapActions, mapState } from "pinia";
import * as api from "@/adc/api";
import { isInstanceAdmin } from "@/adc/rights";
import { authorColor } from "@/medias";
import { useContentStore } from "@/stores/content";
import { useSessionStore } from "@/stores/session";
import BaseModal from "./BaseModal.vue";

const asList = (value) => (Array.isArray(value) ? [...value] : []);

export default {
  components: { BaseModal },
  props: {
    // the cahier's meta, kept up to date by its room
    cahier: { type: Object, required: true },
  },
  emits: ["close", "removed"],
  data() {
    const c = this.cahier;
    return {
      form: {
        title: c.title || "",
        description: c.description || "",
        start: c.start || "",
        end: c.end || "",
        is_open: c.$contributors === "everyone",
        is_private: c.$status === "private",
        admins: asList(c.$admins),
        contributors: asList(c.$contributors),
      },
      roles: ["admins", "contributors"],
      authors: [],
      is_saving: false,
      confirm_remove: false,
      error: "",
    };
  },
  computed: {
    ...mapState(useSessionStore, ["token_path"]),
    slug() {
      return this.cahier.$path.split("/").pop();
    },
    // removing oneself from the admins: the window can't be opened again
    loses_admin() {
      return (
        !!this.token_path &&
        asList(this.cahier.$admins).includes(this.token_path) &&
        !this.form.admins.includes(this.token_path) &&
        !isInstanceAdmin(this.token_path)
      );
    },
  },
  async created() {
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
  methods: {
    ...mapActions(useContentStore, ["updateFolder", "removeFolder"]),
    authorColor,
    authorName(path) {
      const author = this.authors.find((a) => a.$path === path);
      return author?.name || path.split("/").pop();
    },
    // an account is either admin or contributor: admins can do more
    addableAuthors(role) {
      const taken = new Set([...this.form.admins, ...this.form.contributors]);
      if (role === "admins")
        this.form.contributors.forEach((path) => taken.delete(path));
      return this.authors.filter((a) => !taken.has(a.$path));
    },
    addAuthor(role, event) {
      const path = event.target.value;
      event.target.value = "";
      if (!path || this.form[role].includes(path)) return;
      this.form[role] = [...this.form[role], path];
      // made admin: no longer listed as a contributor
      if (role === "admins")
        this.form.contributors = this.form.contributors.filter(
          (p) => p !== path
        );
    },
    async save() {
      if (!this.form.title || !this.form.admins.length || this.is_saving)
        return;
      this.error = "";
      this.is_saving = true;
      const { title, description, start, end, is_open, is_private } = this.form;
      try {
        await this.updateFolder(this.cahier.$path, {
          title,
          description,
          // "" clears them
          start,
          end,
          // adc-core makes folders private when $status is missing
          $status: is_private && !is_open ? "private" : "public",
          $admins: this.form.admins,
          $contributors: is_open ? "everyone" : this.form.contributors,
        });
        this.$emit("close");
      } catch (err) {
        this.error =
          err.code === "unique_field_taken"
            ? this.$t("title_taken")
            : this.$t("error_with_code", { code: err.code || err.message });
      } finally {
        this.is_saving = false;
      }
    },
    async remove() {
      if (this.is_saving) return;
      this.error = "";
      this.is_saving = true;
      try {
        await this.removeFolder(this.cahier.$path);
        this.$emit("removed");
      } catch (err) {
        this.error = this.$t("error_with_code", {
          code: err.code || err.message,
        });
        this.is_saving = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.m_cahierSettings--dates {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-small);

  label {
    flex: 1 1 8rem;
    margin: 0;
    font-size: 1em;
  }
  small {
    flex: 1 0 100%;
  }
}

.m_cahierSettings--hint {
  display: block;
  margin-bottom: var(--spacing-verysmall);
}

.m_cahierSettings--value {
  margin: 0 0 var(--spacing-verysmall);
  font-size: var(--font-size-small);
}

// as the media window's authors
.m_cahierSettings--chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-verysmall);
  margin: 0 0 var(--spacing-verysmall);
  padding: 0;
  list-style: none;

  li {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 1.6rem;
    padding: 0.15rem 0.6rem;
    border-radius: 999px;
    background-color: var(--c-noir);
    font-size: var(--font-size-small);
  }
  li:has(button) {
    padding-right: 0.25rem;
  }
  button {
    padding: 0 0.35rem;
    border-radius: 50%;
    line-height: 1.2;
    color: var(--c-gris_clair);

    &:hover {
      color: white;
    }
  }
}

.m_cahierSettings--dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--author-color);
  box-shadow: 0 0 0 1.5px white;
}

.m_cahierSettings--confirm {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-verysmall);

  p {
    flex: 1 0 100%;
    margin: 0;
  }
}

// as the media window's choices
.m_cahierSettings--choice {
  margin: 0;
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--c-gris_fonce);
  border-radius: var(--radius-button);
  font-size: var(--font-size-small);
  line-height: 1.25;
  color: white;

  &:hover {
    border-color: var(--c-gris_clair);
  }
  &.is--danger {
    border-color: var(--c-rouge);
  }
  &.is--danger.is--active {
    background-color: var(--c-rouge);
    color: white;
  }
}
</style>
