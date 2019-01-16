<template>
  <div>
    <template v-if="$root.state.connected">
      <!-- authors : {{ authors }}<br>
      clients : {{ clients }}<br> -->
      <div  class="m_authors">

        <div class="m_authors--currentAuthor"
          v-if="current_author"
        >
          <button type="button"
            :style="`background-color: ${current_author.color}`"
            v-html="current_author.name"
          >
          </button>
          
        </div>

        <transition-group class="m_authors--authorList"
          name="list-complete"        
        >
          <label 
            :key="'connected_auth_label'"
            v-if="connected_authors.length > 0"
          >
            auteurs connectés
          </label>

          <button type="button"
            v-for="author in connected_authors"
            :key="author.name"
            @click="setAuthor(author.name)"
            :style="`background-color: ${author.color}`"
            v-html="author.name"
          />

          <label 
            :key="'not_connected_auth_label'"
            v-if="not_connected_authors.length > 0"
          >
            non connectés
          </label>

          <button type="button"
            v-for="author in not_connected_authors"
            :key="author.name"
            @click="setAuthor(author.name)"
            v-html="author.name"
          />


        </transition-group>

        <div class="m_authors--createButton">
          <template v-if="!add_author">
            <button type="button" @click="add_author = true">
              Ajouter
            </button>
          </template>
          <template v-else>
            <div class="input-group">
              <span class="input-addon input-addon-xs">Nom</span>
              <input type="text" ref="nameInput" class="input-xs">
              <button 
                type="button" 
                class="button input-addon-xs" 
                @click="createAuthor"
              >
                Valider
              </button>
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
        </template> -->

        <!-- <div class="input-group">
          <span class="input-addon input-addon-xs">Nom</span>
          <input type="text" ref="nameInput" class="input-xs">
          <button type="button" class="button input-addon-xs" @click="updateName">Envoyer</button>
        </div>
 -->
 
      </div>
    </template>
    <template v-else>
      <div class="m_connectionStatus">
        {{ $t('notifications.connection_lost') }} {{ $t('notifications.contents_wont_be_editable') }}      
      </div>   
    </template>
  </div>
</template>
<script>
import randomColor from 'randomColor';

export default {
  props: ['authors', 'slugFolderName'],
  components: {
  },
  data() {
    return {
      add_author: false
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
    clients() {
      return this.$root.state.clients;
    },
    authors_except_current() {
      return this.authors.filter(c => c.name !== this.$root.settings.current_author_name);
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
      return this.authors.filter(c => c.name === this.$root.settings.current_author_name)[0];
    }
  },
  methods: {
    createAuthor() {
      const name = this.$refs.nameInput.value;

      // check for existing name, refuse if already there

      let _authors = [];
      if(!!this.authors) {
        _authors = this.authors.slice(0);
      }
      _authors.push({
        name,
        color: randomColor({luminosity: 'light'})
      });
      
      this.$root.editFolder({
        type: 'folders',
        slugFolderName: this.slugFolderName, 
        data: {
          authors: _authors
        }
      });

      this.add_author = false;
    },
    setAuthor(name) {
      this.$root.settings.current_author_name = name;

      this.$socketio.socket.emit('updateClientInfo', { 
        author_name: name
      });
    },
    author_is_connected(name) {
      return this.clients.filter(c => {
        return c.data.hasOwnProperty('author_name') && c.data.author_name === name;
      }).length > 0;
    }
  }
}
</script>
<style>

</style>