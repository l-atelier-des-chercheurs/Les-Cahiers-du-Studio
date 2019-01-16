<template>
  <div>
    <template v-if="$root.state.connected">
      clients : {{ clients }}<br>
      authors : {{ authors }}
      <div  class="m_authors">

        <div class="m_authors--currentAuthor">
          <button type="button">
            Louis
          </button>
          <!-- <span v-if="!!current_client && current_client.data.hasOwnProperty('author')"
            v-html="current_client.data.author.name"
          /> -->
        </div>

        <div class="m_authors--authorList">
          <label>auteurs</label>

          <button type="button"
            v-for="client in clients_except_current"
            :key="client.name"
            v-html="client.name"
          />

        </div>

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
    clients_except_current() {


      return this.clients.filter(c => c.id !== this.$root.$socketio.socket.id);
    },
    current_client() {
      return this.clients.filter(c => c.id === this.$root.$socketio.socket.id)[0];
    }
  },
  methods: {
    createAuthor() {
      const name = this.$refs.nameInput.value;

      debugger;

      this.$root.editFolder({
        type: 'folders',
        slugFolderName: this.slugFolderName, 
        data:  
      });

      this.$socketio.socket.emit('updateClientInfo', { 
        author: { 
          name
        }
      });
    }
  }
}
</script>
<style>

</style>