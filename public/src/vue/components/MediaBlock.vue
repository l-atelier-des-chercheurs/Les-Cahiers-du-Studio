<template>
  <div>

    <div v-packery="grid_options" class='packery-container'>
      <!-- <div class="packery-grid-sizer"></div> -->

      <!-- <div class="stamp stamp1"></div> -->
      <!-- <div class="stamp stamp2"></div> -->

      <div v-for='(item, index) in items' :key='item.id'  v-draggabilly v-packery-item class='packery-item'
        :style="`width: ${item.width}px; height: ${item.height}px`"
      >
        <div class="packery-item-content"
          :style="itemStyles(item)"
        >
          <span>{{ item.id }}</span>
          <input type='button' value='Remove' @click='setRemoveItem(index)'>
          <input type='button' value='1x1' @click='setSize({ item, w: 1, h: 1 })'><br>
          <!-- <input type='button' value='2x1' @click='setSize({ item, w: 2, h: 1 })'><br>
          <input type='button' value='1x2' @click='setSize({ item, w: 1, h: 2 })'><br> -->
          <input type='button' value='2x2' @click='setSize({ item, w: 2, h: 2 })'>
          
        </div>
      </div>

    </div>

    <div class='controls'>
      <input type="button" value="Add Item" @click='setAddItem()'>
      <input type="button" value="Shuffle Items" @click='setShuffleItems()'>
    </div>
    
    <!-- <div 
      v-for="media in medias"
      :key="media.slugMediaName"
    >
      <MediaContent
        v-model="media.content"
        :slugFolderName="slugFolderName"
        :slugMediaName="media.slugMediaName"
        :media="media"
        :context="'preview'"
      />
    </div> -->
  </div>
</template>
<script>
import MediaContent from './subcomponents/MediaContent.vue';

export default {
  props: {
    medias: Array,
    slugFolderName: String
  },
  components: {
    MediaContent
  },
  data() {
    return {
      items: [],
      grid_options: {
        itemSelector: ".packery-item", 
        percentPosition: false,
        columnWidth: 125,
        rowHeight: 125,
        // gutter: 10,
        horizontal: true,
        stamp: '.stamp',
        transitionDuration: '0.4s',
        // stagger: 10
      },

      colors: [
        '#0A997F',
        '#03a9f4',
        '#38c4b2',
        '#FECD62'
      ]

    }
  },
  
  created() {
    for (let i = 0; i < 6; i++)
    {
      this.setAddItem()
    }
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
  },
  methods: {
    randomNum ()
    {
      const rand = Math.random()
      return Math.ceil(rand * 3) * 125
    },
    setAddItem ()
    {
        this.items.push({
            id: this.items.length + 1,
            height: this.randomNum(),
            width: this.randomNum(),
            bgColor: this.colors[Math.round(Math.random()*(this.colors.length-1))]
        })
    },
    setRemoveItem (index)
    {
      this.items.splice(index, 1)
    },
    setShuffleItems ()
    {
      this.items.sort(() =>
      {
        return 0.5 - Math.random()
      })
    },
    itemStyles(item) {
      return {
        width: item.width + 'px',
        height: item.height + 'px',
        backgroundColor: item.bgColor
      }
    },
    setSize({ item, w, h }) {
      item.width = w * this.grid_options.columnWidth;
      item.height = h * this.grid_options.rowHeight;
    }
  }
}
</script>
<style>
.packery-container {
  background-color: #41f4a3;
  height: 100vh;
}
/* .packery-grid-sizer {
  width: 25px;
  height: 25px;
} */
.packery-item, .packery-item-content {
  width: 250px;
  height:250px;
  cursor: pointer;
}
.packery-item {
  /* padding: 1rem; */
  /* border: 0.2rem dashed #f4be41; */
  box-sizing: border-box;
}

.packery-item-content {
  width: 100%;
  height: 100%;
  background-color: #f4eb42;
  transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1), height 0.4s cubic-bezier(0.19, 1, 0.22, 1);  
}

.packery-item span{
  display: block;
  font-size: 1.4rem;
  color: #f4be41;
  margin-bottom: 1rem;
}
.packery-item input{
  color: #fff;
  font-size: 1rem;
  padding: 0.5rem;
  background-color: #f4be41;
  border: none;
}
.controls {
  margin-top: 2rem;
  text-align: center;
}
.controls input {
  color: #fff;
  font-size: 1rem;
  padding: 0.5rem;
  background-color: #444;
  border: none;
  margin: 0 1rem;
}

/* position stamp elements with CSS */
.stamp {
  position: absolute;
  background: orange;
  /* border: 4px dotted black; */
}
.stamp1 {
  left: 0px;
  top: 0px;
  width: 250px;
  height: 200px;
}
.stamp2 {
  right: 10%;
  top: 20px;
  width: 70%;
  height: 30px;
}
.packery-drop-placeholder {
  outline: 3px dashed hsla(0, 0%, 0%, 0.2);
  outline-offset: -6px;
  -webkit-transition: -webkit-transform 0.2s;
          transition: transform 0.2s;
}
</style>