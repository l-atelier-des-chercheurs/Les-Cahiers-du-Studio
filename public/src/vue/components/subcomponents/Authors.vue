<template>
  <div class="m_authors">
    <div class="m_authors--currentAuthor" v-if="current_author">
      <button
        type="button"
        :style="`background-color: ${current_author.color}`"
        v-html="current_author.name"
      ></button>

      <br />

      <button
        type="button"
        class="m_authors--currentAuthor--changeColor"
        @click="change_color_menu = !change_color_menu"
      >{{ $t('change_color') }}</button>

      <button
        type="button"
        class="m_authors--currentAuthor--changeColor"
        @click="unsetAuthor"
      >{{ $t('disconnect') }}</button>
    </div>

    <transition-group class="m_authors--authorList" name="list-complete">
      <template v-if="change_color_menu">
        <div v-for="color in sortedRandomColorArray" :key="color" @click="changeColor(color)">
          <div class="color_item" :style="`background-color: ${color}`" />
        </div>
      </template>
      <template v-else>
        <label
          :key="'connected_auth_label'"
          v-if="connected_authors.length > 0"
        >{{ $t('author_connected') }}</label>

        <button
          type="button"
          v-for="author in connected_authors"
          :key="author.name"
          @click="setAuthor(author.name)"
          :style="`background-color: ${author.color}`"
        >{{ author.name }}</button>

        <label
          :key="'not_connected_auth_label'"
          v-if="not_connected_authors.length > 0"
        >{{ $t('not_connected') }}</label>

        <button
          type="button"
          v-for="author in not_connected_authors"
          :key="author.name"
          @click="setAuthor(author.name)"
        >
          <span :style="`color: ${author.color}`">•</span>
          {{author.name }}
        </button>
      </template>
    </transition-group>

    <div class="m_authors--createButton">
      <template v-if="!add_author">
        <button type="button" @click="add_author = true">{{ $t('add_author') }}</button>
      </template>
      <template v-else>
        <div class="input-group">
          <span class="input-addon input-addon-xs">{{ $t('name') }}</span>
          <input type="text" ref="nameInput" class="input-xs" />
          <button type="button" class="button input-addon-xs" @click="createAuthor">{{ $t('add') }}</button>
        </div>
      </template>
    </div>

    <!-- <template v-if="clients_except_current.length > 0">
      <label v-if="clients_except_current.length == 1">1 autre utilisateur&nbsp;:</label>
      <label v-if="clients_except_current.length >= 2">{{ clients_except_current.length }} autres utilisateurs&nbsp;:</label>
      <div 
        class="m_authors--client"
        :key="client.id"
        v-for="client in clients_except_current"
        
      >
        <span v-if="client.data.hasOwnProperty('author')"
          v-html="client.data.author.name"
        />
        <span v-else v-html="'anonyme'" />
      </div>
    </template>-->

    <!-- <div class="input-group">
      <span class="input-addon input-addon-xs">Nom</span>
      <input type="text" ref="nameInput" class="input-xs">
      <button type="button" class="button input-addon-xs" @click="updateName">Envoyer</button>
    </div>
    -->
  </div>
</template>
<script>
import randomcolor from "randomcolor";
import hexsorter from "hexsorter";

export default {
  props: {
    authors: {
      type: Array,
      default: []
    },
    slugFolderName: {
      type: String
    }
  },
  components: {},
  data() {
    return {
      add_author: false,
      change_color_menu: false
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},

  watch: {},
  computed: {
    clients() {
      return this.$root.state.clients;
    },
    authors_except_current() {
      return this.authors.filter(
        c => c.name !== this.$root.settings.current_author_name
      );
    },
    connected_authors() {
      return this.authors_except_current.filter(a => {
        const name = a.name;
        return this.author_is_connected(name);
      });
    },
    not_connected_authors() {
      return this.authors_except_current.filter(a => {
        const name = a.name;
        return !this.author_is_connected(name);
      });
    },
    current_author() {
      return this.authors.filter(
        c => c.name === this.$root.settings.current_author_name
      )[0];
    },
    randomColorArray() {
      let random_color = randomcolor({
        luminosity: "light",
        count: 25
      });
      return random_color;
    },
    sortedRandomColorArray() {
      let sorted_color_array = [];
      let input = this.randomColorArray;
      for (let i = input.length - 1; i >= 0; i--) {
        let color = hexsorter.mostBrightColor(input);
        input.splice(input.indexOf(color), 1);
        sorted_color_array.push(color);
      }
      return sorted_color_array;
    }
  },
  methods: {
    createAuthor() {
      const name = this.$refs.nameInput.value.trim();

      let _authors = [];
      if (!!this.authors) {
        // check for existing name, refuse if already there
        if (this.authors.filter(a => a.name === name).length > 0) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("notifications.author_name_exists"));
          return false;
        }
        _authors = this.authors.slice(0);
      }
      _authors.push({
        name,
        color: randomcolor({ luminosity: "light" })
      });

      this.$root.editFolder({
        type: "folders",
        slugFolderName: this.slugFolderName,
        data: {
          authors: _authors
        }
      });

      this.add_author = false;
    },
    unsetAuthor() {
      this.$root.settings.current_author_name = false;
      this.change_color_menu = false;
      this.$socketio.socket.emit("updateClientInfo", {
        author_name: false
      });
    },
    setAuthor(name) {
      this.$root.settings.current_author_name = name;
      this.$socketio.socket.emit("updateClientInfo", {
        author_name: name
      });
    },
    author_is_connected(name) {
      return (
        this.clients.filter(c => {
          return (
            c.data.hasOwnProperty("author_name") && c.data.author_name === name
          );
        }).length > 0
      );
    },

    changeColor(color) {
      this.current_author.color = color;

      this.$root.editFolder({
        type: "folders",
        slugFolderName: this.slugFolderName,
        data: {
          authors: this.authors
        }
      });

      this.change_color_menu = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.color_item {
  width: 35px;
  height: 35px;
  margin: 5px;
}
.m_authors {
  position: relative;
  right: -15px;
  flex-flow: column nowrap;
  max-width: 300px;
  max-height: 250px;
  box-shadow: -0.1em 0.2em 1em rgba(0, 0, 0, 0.35);
  margin: 15px;
  color: white;
  pointer-events: auto;
}

.m_authors .m_authors--authorList {
  flex-flow: row wrap;
  flex: 1 1 auto;
  justify-content: flex-start;
  align-content: flex-start;
}
</style>