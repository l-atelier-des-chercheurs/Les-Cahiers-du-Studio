<template>
  <div>
    <template v-if="$root.state.connected">
      <div  class="m_clientsList">
        Actuellement connecté comme :
        <div class="input-group">
          <input type="text" @change="updateName">
          <button type="button" class="button">Submit</button>
        </div>

        <label>Autres utilisateurs ({{ clients.length - 1 }})</label>
        <div 
          class="m_clientsList--client"
          :key="client.id"
          v-for="client in clients_except_current"
          
        >
          <template v-if="client.data.hasOwnProperty('author')">
            {{ client.data.author.name }}
          </template>
          <template v-else>        
            anonyme
          </template>
        </div>
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
  props: {
  },
  components: {
  },
  data() {
    return {
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
    }
  },
  methods: {
    updateName(e) {
      this.$socketio.socket.emit('updateClientInfo', { 
        author: { 
          name: e.target.value 
        }
      });
    }
  }
}
</script>
<style>

</style>