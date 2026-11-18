<template>
  <!-- v2's ListView.vue and Folder.vue -->
  <main class="m_home">
    <header class="m_home--header">
      <div class="m_home--prototype">
        <PrototypeBadge @notice="$emit('notice')" />
      </div>
      <div class="m_home--header--content limited-width">
        <div class="m_home--header--title">
          <svg class="stvlogo" viewBox="0 0 40.5 26.1" aria-hidden="true">
            <path
              d="M37.2,7.1c-0.7,6.7-7,16-13.2,16c-1.9,0-3.2-2.5-3.2-6c0-7.8,5.5-11.8,5.5-15.4c0-1-0.7-1.7-1.7-1.7 c-1.3,0-2.4,0.5-5,1.9L15,4.3l1.1,2.3L23.1,3c-4,5.7-5.5,10.4-5.5,14.3c0,3.2,1.2,8.8,5.8,8.8c8.4,0,17.1-12.1,17.1-21.3 c0-3.3-1.5-4.8-3.6-4.8c-2,0-3.5,1.5-3.5,3.5C33.4,5.8,35.2,7.1,37.2,7.1 M0,21.4c0,2.8,2,4.7,4.6,4.7c2.6,0,4.8-1.9,4.8-4.7 c0-2.7-2.1-4.7-4.8-4.7C2,16.6,0,18.7,0,21.4"
            />
          </svg>
          <div>
            <h1 class="font-large">
              › <i>{{ instance_name }}</i>
            </h1>
            <div class="font-small">v{{ app_infos.version }}</div>
          </div>
        </div>

        <div class="m_home--header--presentation text-formatting">
          <p class="m_home--tagline">
            {{ $t("tagline") }}
            <button
              type="button"
              class="textLink"
              :aria-expanded="show_more_infos"
              @click="show_more_infos = !show_more_infos"
            >
              {{ show_more_infos ? $t("less_infos") : $t("more_infos") }}
            </button>
          </p>
          <template v-if="show_more_infos">
            <p v-for="(paragraph, i) in presentation" :key="i">
              {{ paragraph }}
            </p>
            <div class="m_home--newVersion border-top-dashed">
              <p>{{ $t("new_version_notice") }}</p>
              <p>{{ $t("new_version_partners") }}</p>
              <ul>
                <li v-for="partner in partners" :key="partner.name">
                  <a
                    v-if="partner.url"
                    :href="partner.url"
                    target="_blank"
                    rel="noopener"
                    >{{ partner.name }}</a
                  >
                  <template v-else>{{ partner.name }}</template>
                </li>
              </ul>
            </div>
            <div class="border-top-dashed">
              <i18n-t keypath="more_information" tag="p" scope="global">
                <template #documentation>
                  <a :href="documentation_url" target="_blank" rel="noopener">{{
                    $t("documentation")
                  }}</a>
                </template>
                <template #contact>
                  <a :href="contact_url">{{ $t("contact") }}</a>
                </template>
              </i18n-t>
            </div>
          </template>
        </div>
      </div>
    </header>

    <section class="m_home--list limited-width">
      <div class="m_home--author">
        •
        <template v-if="is_logged_in">
          {{ $t("connected_as") }}
          <button type="button" class="textLink" @click="$emit('login')">
            {{ author_name }}
          </button>
          <button type="button" class="textLink font-small" @click="logout">
            ({{ $t("logout") }})
          </button>
        </template>
        <button v-else type="button" class="textLink" @click="$emit('login')">
          {{ $t("login") }}
        </button>
      </div>

      <div class="m_home--listTitle border-bottom-dashed">
        <div>{{ $t("list_of_cahiers") }}</div>
        <button
          type="button"
          class="m_home--searchButton"
          :class="{ 'is--active': show_search }"
          @click="toggleSearch"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="9.5" cy="6.5" r="4.5" />
            <line x1="6.3" y1="9.7" x2="1.5" y2="14.5" />
          </svg>
          {{ $t("search_by_name") }}
        </button>
      </div>
      <div v-if="show_search" class="m_home--searchField">
        <label for="search_cahier">{{ $t("name_to_find") }}</label>
        <input
          id="search_cahier"
          ref="search"
          v-model="search"
          type="text"
          @keydown.esc="toggleSearch"
        />
      </div>

      <p v-if="error" class="form-error m_home--message">{{ error }}</p>
      <p v-else-if="!cahiers" class="m_home--message">{{ $t("loading") }}</p>

      <TransitionGroup v-else tag="div" name="list" class="m_home--folders">
        <button
          v-if="!search && can_create_cahier"
          key="create"
          type="button"
          class="m_home--folders--card m_home--folders--card_createButton"
          @click="openCreateModal"
        >
          <span>{{ $t("create_cahier") }}</span>
          <svg viewBox="0 0 46.99 46.99" aria-hidden="true">
            <circle cx="23.5" cy="23.5" r="23" />
            <line x1="23.5" y1="8.86" x2="23.5" y2="38.13" />
            <line x1="8.86" y1="23.5" x2="38.13" y2="23.5" />
          </svg>
        </button>

        <article
          v-for="cahier in filtered_cahiers"
          :key="cahier.$path"
          class="m_home--folders--card m_folder"
        >
          <h2 class="m_folder--title">
            {{ cahier.title || cahier.$path.split("/").pop() }}
          </h2>
          <div class="m_folder--infos">
            <div v-if="cahier.$status === 'private'" class="m_metaField">
              <mark>{{ $t("private").toLowerCase() }}</mark>
            </div>
            <div v-if="cahier.$contributors === 'everyone'" class="m_metaField">
              <mark>{{ $t("open_to_everyone") }}</mark>
            </div>
            <div v-if="cahier.$date_created" class="m_metaField">
              <i>{{ $t("created_date") }}</i>
              <div>{{ formatDate(cahier.$date_created) }}</div>
            </div>
            <div v-if="cahier.$date_modified" class="m_metaField">
              <i>{{ $t("last_modified") }}</i>
              <div>{{ formatDate(cahier.$date_modified) }}</div>
            </div>
          </div>
          <hr />
          <div class="m_folder--buttons">
            <RouterLink
              :to="{
                name: 'cahier',
                params: { slug: cahier.$path.split('/').pop() },
              }"
              class="button button-round"
            >
              <svg viewBox="0 0 46.99 46.99" aria-hidden="true">
                <circle class="_bg" cx="23.5" cy="23.5" r="23" />
                <polyline
                  points="33.33 23.74 33.33 33.96 23.11 33.96 12.88 33.96 12.88 23.74 12.88 13.52 23.11 13.52"
                />
                <polyline points="26.73 13.52 33.33 13.52 33.33 20.12" />
                <line x1="33.05" y1="13.89" x2="22.1" y2="24.83" />
              </svg>
              <span class="text-cap font-verysmall">{{ $t("open") }}</span>
            </RouterLink>
          </div>
        </article>
      </TransitionGroup>

      <p
        v-if="cahiers && search && filtered_cahiers.length === 0"
        class="m_home--message"
      >
        {{ $t("no_cahier_found") }}
      </p>
    </section>

    <CreateCahierModal
      v-if="show_create_modal"
      @close="show_create_modal = false"
      @created="openCahier"
    />
  </main>
</template>

<script>
import { mapActions, mapState } from "pinia";
import * as api from "@/adc/api";
import { canSeeFolder, isInstanceAdmin } from "@/adc/rights";
import { i18n } from "@/i18n";
import { useContentStore } from "@/stores/content";
import { useSessionStore } from "@/stores/session";
import CreateCahierModal from "@/components/CreateCahierModal.vue";
import PrototypeBadge from "@/components/PrototypeBadge.vue";

// "Élise" and "elise" match
const normalize = (text) =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default {
  components: { CreateCahierModal, PrototypeBadge },
  emits: ["login", "notice"],
  data() {
    return {
      // set by adc-core's index.pug
      app_infos: window.app_infos,
      documentation_url:
        "https://latelier-des-chercheurs.fr/docs/manuel-les-cahiers-du-studio",
      contact_url:
        "mailto:info@latelier-des-chercheurs.fr?subject=Les Cahiers du Studio",
      // partners of the v3, shown on every instance
      partners: [
        { name: "Fabien Pinaroli et l’association Ainsi Parlait" },
        {
          name: "la Fédération APCP",
          url: "https://www.federation-apcp.org/",
        },
        { name: "la Métropole de Lyon", url: "https://www.grandlyon.com" },
        {
          name: "le FDVA innovation du Département",
          url: "https://www.associations.gouv.fr/fdva.html",
        },
        { name: "le CDN de Tours", url: "https://cdntours.fr" },
        {
          name: "la Manufacture à Lausanne",
          url: "https://www.manufacture.ch",
        },
      ],
      error: "",
      show_create_modal: false,
      // to open the create modal once logged in
      create_after_login: false,
      author_name: "",
      show_search: false,
      // presentation, partners and links, folded by default
      show_more_infos: false,
      search: "",
    };
  },
  computed: {
    ...mapState(useSessionStore, ["is_logged_in", "token_path", "author_slug"]),
    ...mapState(useContentStore, ["getFolders"]),
    instance_name() {
      return (
        this.app_infos.instance_meta?.name || this.app_infos.product_name || ""
      );
    },
    // the instance's own presentation, or the app's
    presentation() {
      const text =
        this.app_infos.instance_meta?.presentation ||
        this.$t("default_presentation");
      return String(text)
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
    },
    // only instance admins create cahiers ($admins "everyone" lets anyone,
    // logging in first)
    can_create_cahier() {
      return isInstanceAdmin(this.token_path);
    },
    // kept up to date by the "cahiers" room (stores/content.js)
    cahiers() {
      return this.getFolders("cahiers");
    },
    filtered_cahiers() {
      const search = normalize(this.search.trim());
      return this.cahiers
        .filter((cahier) => canSeeFolder(cahier, this.token_path))
        .filter(
          (cahier) =>
            !search || normalize(cahier.title ?? cahier.$path).includes(search)
        )
        .sort((a, b) =>
          String(b.$date_created ?? "").localeCompare(
            String(a.$date_created ?? "")
          )
        );
    },
  },
  watch: {
    // what the server lists depends on who is logged in
    token_path: {
      handler() {
        this.loadAuthorName();
        this.load(this.loadFolders);
        if (this.is_logged_in && this.create_after_login)
          this.show_create_modal = true;
        this.create_after_login = false;
      },
    },
  },
  created() {
    this.load(this.openFolders);
    this.loadAuthorName();
  },
  beforeUnmount() {
    this.closeFolders("cahiers");
  },
  methods: {
    ...mapActions(useContentStore, [
      "openFolders",
      "loadFolders",
      "closeFolders",
    ]),
    ...mapActions(useSessionStore, ["logout"]),
    async load(action) {
      this.error = "";
      try {
        await action("cahiers");
      } catch (err) {
        this.error = this.$t("error_with_code", {
          code: err.code || err.message,
        });
      }
    },
    async loadAuthorName() {
      this.author_name = this.author_slug ?? "";
      if (!this.token_path) return;
      const author = await api.getFolder(this.token_path).catch(() => {});
      if (author?.name) this.author_name = author.name;
    },
    // creating a cahier needs an author: log in first
    openCreateModal() {
      if (this.is_logged_in) return (this.show_create_modal = true);
      this.create_after_login = true;
      this.$emit("login");
    },
    // e.g. "cahiers/mon-cahier", once created
    openCahier(path_to_folder) {
      this.show_create_modal = false;
      this.$router.push({
        name: "cahier",
        params: { slug: path_to_folder.split("/").pop() },
      });
    },
    toggleSearch() {
      this.show_search = !this.show_search;
      if (this.show_search) this.$nextTick(() => this.$refs.search?.focus());
      else this.search = "";
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString(i18n.global.locale.value, {
        dateStyle: "long",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
/* HEADER */

.m_home--header {
  padding: var(--spacing-medium) 0;
  background-color: var(--c-noir);
  color: white;
}

// the prototype's message, centred above the title
.m_home--prototype {
  display: flex;
  justify-content: center;
  padding: 0 var(--spacing-small);
}

.m_home--header--content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.m_home--header--title {
  display: flex;
  flex: 1 1 40%;
  flex-wrap: wrap;
  align-items: center;
  padding: var(--spacing-medium);

  h1 {
    letter-spacing: 0.05em;
  }
}

.stvlogo {
  flex: 0 0 auto;
  width: 75px;
  height: 50px;
  margin-right: var(--spacing-medium);
  fill: white;
}

.m_home--header--presentation {
  flex: 1 1 60%;
  padding: var(--spacing-small);
  line-height: 1.6;

  a {
    color: inherit;
  }
}

.m_home--newVersion ul {
  margin: 0 0 1em;
  padding-left: 1.2em;
}

@media screen and (max-width: 50rem) {
  .m_home--header--title,
  .m_home--header--presentation {
    flex-basis: 100%;
  }
}

/* LIST */

.m_home--list {
  padding: var(--spacing-small) 0;
}

.m_home--author,
.m_home--listTitle,
.m_home--searchField,
.m_home--message {
  margin: 0 var(--spacing-small);
}

.m_home--author {
  padding: var(--spacing-small) 0 var(--spacing-verysmall);
}

.m_home--listTitle {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-small);
  padding: var(--spacing-verysmall) 0 var(--spacing-small);
}

.m_home--searchButton {
  display: flex;
  align-items: center;
  gap: 0.2em;
  padding: 0;

  svg {
    width: 0.9em;
    height: 0.9em;
    fill: none;
    stroke: currentColor;
    stroke-width: 2px;
  }

  &.is--active {
    text-decoration: underline;
  }
}

.m_home--searchField {
  max-width: 320px;
  margin-top: var(--spacing-small);
  margin-left: auto;
}

.m_home--message {
  padding: var(--spacing-small) 0;
}

/* CARDS */

.m_home--folders {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  margin: var(--spacing-small) 0;
}

.m_home--folders--card {
  flex: 0 0 auto;
  width: 235px;
  max-width: calc(100% - var(--skipline));
  min-height: 200px;
  margin: var(--spacing-small);
  background-color: white;
  color: black;
}

.m_home--folders--card_createButton {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-small);
  padding: var(--spacing-small);

  svg {
    width: 47px;
    height: 47px;
    fill: none;
    stroke: #333;
    stroke-miterlimit: 10;
  }

  &:hover svg circle,
  &:focus-visible svg circle {
    fill: var(--c-gris_tresclair);
  }
}

.m_folder--title {
  padding: var(--spacing-medium);
  background-color: var(--c-noir);
  color: white;
  font-size: var(--font-size-large);
  overflow-wrap: anywhere;
}

.m_folder--infos {
  padding-top: var(--spacing-small);
}

.m_metaField {
  margin: var(--spacing-small) var(--spacing-medium);
  font-size: var(--font-size-small);
  line-height: 1.25;
}

mark {
  background-color: #ffff00;
  color: black;
}

.m_folder hr {
  margin: var(--spacing-small) var(--spacing-medium);
}

.m_folder--buttons {
  display: flex;
  justify-content: center;
  padding: var(--spacing-verysmall) var(--spacing-small) var(--spacing-medium);

  .button-round {
    padding: var(--spacing-verysmall);

    // v2's look even while it can't open anything yet
    &:disabled {
      opacity: 1;
      cursor: default;
    }
  }

  svg {
    fill: none;
    stroke: #333;
    stroke-miterlimit: 10;

    ._bg {
      fill: white;
      stroke: var(--c-noir_light);
    }
  }

  span {
    margin-top: var(--spacing-verysmall);
    letter-spacing: 0.1em;
  }
}

// new cahiers fade in
.list-enter-active {
  transition:
    opacity 0.6s,
    transform 0.6s;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(0.5rem);
}
</style>
