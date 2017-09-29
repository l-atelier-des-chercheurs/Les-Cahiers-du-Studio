<template>
  <div class="m_sidebar" ref="sidebar">
    <div class="intro">
      <h3>
        Liste des médias de cette timeline.
      </h3>
    </div>

    <table class="table-striped table-hoverable">
      <thead>
        <tr>
          <th>Nom du média</th>
          <th>
            <select v-model="secondColumn">
              <option v-for="mediaType in mediaKeys()">
                {{ mediaType }}
              </option>
            </select>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(media, index) in medias"
          v-bind:key="index"
        >
          <td>{{ index }}</td>
          <td>{{ media[secondColumn] }}</td>
        </tr>
      </tbody>
    </table>
    <ul>
      <li
      >
      </li>
    </ul>

  </div>
</template>
<script>
export default {
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object
  },
  data() {
    return {
      secondColumn: 'created'
    }
  },
  methods: {
    mediaKeys: function() {
      return Object.keys(locals.structure.media);
    }
  }

}
</script>

<style lang="sass">


</style>