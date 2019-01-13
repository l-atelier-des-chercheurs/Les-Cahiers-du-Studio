<template>
  <Modal
    :backgroundColor="mediadata.color"
    @close="$emit('close')"
    @submit="editThisMedia"
    @arrow_left="$eventHub.$emit('editmediamodal.previousmedia')"
    @arrow_right="$eventHub.$emit('editmediamodal.nextmedia')"
    :read_only="read_only"
    :typeOfModal="media.type !== 'text' ? 'LargeAndNoScroll' : 'LargeAndNoScroll'"
    :askBeforeClosingModal="askBeforeClosingModal"
    :show_sidebar="$root.media_modal.show_sidebar"
    :is_minimized="$root.media_modal.minimized"
    :can_minimize="false"
    :arrow_navigation="true"
  >
    <template slot="header">
      <span class="text-cap"> {{ $t('edit_the_media') }}</span><br><i>{{ slugMediaName }}</i>
    </template>

    <template slot="sidebar">
<!-- Caption -->
      <div 
        v-if="(!read_only || !!mediadata.caption) && mediadata.type !== 'marker' && mediadata.type !== 'text'"
        class="margin-bottom-small" 
      >
        <label>{{ $t('caption') }}</label><br>
        <textarea v-model="mediadata.caption" :readonly="read_only">
        </textarea>
      </div>

      <div class="margin-bottom-small">
        <label>{{ $t('date') }} <small v-if="!read_only">{{ $t('for_the_placement_on_timeline') }}</small></label>
        <DateTime v-model="mediadata.date_timeline" :twowaybinding=true :read_only="read_only">
        </DateTime>

        <template v-if="!read_only">
          <div class="margin-bottom-small" v-if="media.date_created !== undefined">
            <small>
              {{ $t('created_date') }}
              <button
                type="button"
                class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
                @click="setMediaDateTimeline(media.date_created)"
                >
                {{ date_created_human }}
              </button>
            </small>
          </div>

          <div class="margin-bottom-small" v-if="media.date_upload !== undefined">
            <small>
              {{ $t('sent_date') }}
              <button
                type="button"
                class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
                @click="setMediaDateTimeline(media.date_upload)"
                >
                {{ date_uploaded_human }}
              </button>
            </small>
          </div>

          <div class="margin-bottom-small" v-if="isRealtime">
            <small>
              {{ $t('currently') }}
              <button
                type="button"
                class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
                @click="setMediaDateTimeline(currentTime)"
                >
                {{ currentTime_human }}
              </button>
            </small>
          </div>
        </template>

      </div>

<!-- Type of media (if guessed wrong from filename, will only be stored in the meta file and used as a reference when displaying that media on the client) -->
<!-- Disabled for now: if an image or video is tagged as "text" or marked, a folder becomes unreadable -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('type') }}</label>
        <select v-if="!read_only" ref="type" v-model="mediadata.type">
          <option v-for="mediaType in $root.state.structure.media.type.options" :key="mediaType">
            {{ mediaType }}
          </option>
        </select>
        <input type="text" v-else :value="mediadata.type" readonly>
      </div> -->

<!-- Color -->
      <div v-if="!read_only" class="margin-bottom-small">
        <label>{{ $t('color') }}</label>
        <select v-if="!read_only" ref="type" v-model="mediadata.color">
          <option v-for="mediaColor in $root.state.structure['folders'].medias.fields.color.options" :key="mediaColor">
            {{ mediaColor }}
          </option>
        </select>
        <input type="text" v-else :value="mediadata.color" readonly>
      </div>

<!-- Keywords -->
      <div v-if="!read_only || !!mediadata.keywords" class="margin-bottom-small">
        <label>{{ $t('keywords') }}</label>
        <textarea v-model="mediadata.keywords" :readonly="read_only">
        </textarea>
      </div>

<!-- Author(s) -->
      <div v-if="!read_only || !!mediadata.authors" class="margin-bottom-small">
        <label>{{ $t('author') }}</label>
        <textarea v-model="mediadata.authors" :readonly="read_only">
        </textarea>
      </div>

<!-- Public or private -->
      <div v-if="!read_only" class="margin-bottom-small">
        <span class="switch">
          <input type="checkbox" class="switch" id="publicswitch" v-model="mediadata.public" :readonly="read_only">
          <label for="publicswitch">{{ $t('public') }}</label>
        </span>
      </div>

      <div class="m_modal--buttonrow flex-wrap flex-vertically-start flex-space-between flex-same-basis">
        <button type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
          @click="removeMedia()"
          :disabled="read_only"
          v-if="!read_only"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
            <g id="Calque_2" data-name="Calque 2">
              <g id="Editeur_txt" data-name="Editeur txt">
                <g>
                  <g>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d"/>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                  <g>
                    <path d="M16.79,35.19l-.72-16.86H33l-.72,16.86a1.42,1.42,0,0,1-1.46,1.31H18.25A1.42,1.42,0,0,1,16.79,35.19Z" style="fill: #4d4d4d;stroke: #fff;stroke-miterlimit: 10"/>
                    <path d="M20.83,15.41v-2a.89.89,0,0,1,.92-.86h5.52a.89.89,0,0,1,.92.86v2Z" style="fill: #4d4d4d;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="20.75" y1="34.18" x2="20.75" y2="21.01" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="24.66" y1="34.18" x2="24.66" y2="21.01" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="28.58" y1="34.18" x2="28.58" y2="21.01" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="14" y1="15.41" x2="35" y2="15.41" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                </g>
              </g>
            </g>
          </svg>

          <span class="text-cap font-verysmall">
            {{ $t('remove') }}
          </span>
        </button>

        <button type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
          @click.prevent="printMedia()"
          v-if="!read_only"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
            <g id="Calque_2" data-name="Calque 2">
              <g id="Editeur_txt" data-name="Editeur txt">
                <g>
                  <g>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d"/>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                  <g>
                    <rect x="12.5" y="18.57" width="24" height="12.78" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <polyline points="16.83 18.57 16.83 15.54 20.38 12.03 32.17 12.03 32.17 18.57" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <rect x="16.83" y="25.95" width="15.33" height="10.08" style="fill: #4d4d4d;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="19.12" y1="29.29" x2="29.53" y2="29.29" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="19.12" y1="32.17" x2="29.53" y2="32.17" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="14.11" y1="25.95" x2="34.86" y2="25.95" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <ellipse cx="32.37" cy="22.15" rx="0.75" ry="0.74" style="fill: #fff;stroke: #fff;stroke-miterlimit: 10"/>
                    <polyline points="20.02 11.99 20.02 15.49 16.52 15.49" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                </g>
              </g>
            </g>
          </svg>
          <span class="text-cap font-verysmall">
            {{ $t('print') }}
          </span>
        </button>

        <a :href="mediaURL" :title="slugMediaName" target="_blank"
          class="button bg-transparent button-round margin-verysmall padding-verysmall"
          v-if="mediadata.type === 'image' && !read_only"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
            <g id="Calque_2" data-name="Calque 2">
              <g id="Editeur_txt" data-name="Zoom">
                <g>
                  <g>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d"/>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                  <circle cx="28.41" cy="20.96" r="8.75" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  <circle cx="28.41" cy="20.96" r="8.75" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  <rect x="12.37" y="30.04" width="11.71" height="2.65" transform="translate(-16.84 22.08) rotate(-45)" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  <line x1="28.64" y1="16.82" x2="28.64" y2="25.21" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  <line x1="24.45" y1="21.02" x2="32.84" y2="21.02" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                </g>
              </g>
            </g>
          </svg>
          <span class="text-cap font-verysmall">
            {{ $t('zoom') }}
          </span>
        </a>

        <a :download="slugMediaName" :href="mediaURL" :title="slugMediaName" target="_blank"
          class="button bg-transparent button-round margin-verysmall padding-verysmall"
          v-if="$root.state.mode !== 'export' || ($root.state.hasOwnProperty('export_options') && $root.state.export_options.allow_download !== 'false')"
          :disabled="$root.state.mode === 'live' && read_only"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
            <g id="Calque_2" data-name="Calque 2">
              <g id="Editeur_txt" data-name="Editeur txt">
                <g>
                  <g>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d"/>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                  <g>
                    <polyline points="33.12 20.63 24.5 28.82 15.88 20.63" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="24.5" y1="28.82" x2="24.5" y2="12.53" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                  <line x1="13.26" y1="34.05" x2="35.74" y2="34.05" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                </g>
              </g>
            </g>
          </svg>
          <span class="text-cap font-verysmall">
            {{ $t('download') }}
          </span>
        </a>
      </div>

    </template>

    <template slot="submit_button">
      <template v-if="!alt_key_is_pressed">
        {{ $t('save_and_close') }}
      </template>
      <template v-else>
        {{ $t('save') }}
      </template>
    </template>

    <template slot="preview">
      <MediaContent
        :context="'edit'"
        :slugMediaName="slugMediaName"
        :slugFolderName="slugFolderName"
        :media="media"
        :mediaURL="mediaURL"
        :read_only="read_only"
        v-model="mediadata.content"
      >
      </MediaContent>
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import alertify from 'alertify.js';
import MediaContent from '../subcomponents/MediaContent.vue';
import DateTime from '../subcomponents/DateTime.vue';

export default {
  props: {
    slugFolderName: String,
    slugMediaName: String,
    media: Object,
    isRealtime: Boolean,
    currentTime: Object,
    read_only: {
      type: Boolean,
      default: true
    }
  },
  components: {
    Modal,
    DateTime,
    MediaContent
  },
  data() {
    return {
      mediadata: {
        date_timeline: this.media.date_timeline,
        type: this.media.type,
        color: this.media.color,
        authors: this.media.authors,
        caption: this.media.caption,
        keywords: this.media.keywords,
        public: this.media.public,
        content: this.media.content
      },
      mediaURL: this.$root.state.mode === 'export' ? `./${this.slugFolderName}/${this.slugMediaName}` : `/${this.slugFolderName}/${this.slugMediaName}`,
      alt_key_is_pressed: false,
      askBeforeClosingModal: false
    };
  },
  watch: {
    'mediadata': {
      handler() {
        debugger;
        this.askBeforeClosingModal = true;
      },
      deep: true
    }
  },
  mounted() {
    // document.addEventListener('keyup', this.keyPressed);
  },
  beforeDestroy: function() {
    // document.removeEventListener('keyup', this.keyPressed);
  },
  computed: {
    date_created_human() {
      return this.$moment(this.media.date_created).format('l LTS');
    },
    date_uploaded_human() {
      return this.$moment(this.media.date_upload).format('l LTS');
    },
    currentTime_human() {
      return this.$moment(this.currentTime).format('l LTS');
    }
  },
  methods: {
    keyPressed: function(event) {
      // if (window.state.dev_mode === 'debug') {
      //   console.log('METHODS • EditMedia: keyPressed');
      // }


      // if (event.target.tagName.toLowerCase() === 'input' 
      //   || event.target.tagName.toLowerCase() === 'textarea'
      //   || event.target.className.includes('ql-editor')
      // ) {
      //   return;
      // }      

      // if(event.key === 'Alt') {
      //   this.alt_key_is_pressed = !this.alt_key_is_pressed;
      //   return;
      // }

      // if(event.key === 'p' || event.key === 'P') {
      //   this.mediadata.public = !this.mediadata.public;
      // }

      // if(event.key === 'Enter') {
      //   this.editThisMedia(); 
      // }
    },
    printMedia: function() {
      window.print();
    },
    openMediaNewWindow: function() {},
    removeMedia: function() {
      if (window.confirm(this.$t('sureToRemoveMedia'))) {

        this.$root.removeMedia({ 
          type: 'folders',
          slugFolderName: this.slugFolderName, 
          slugMediaName: this.slugMediaName,
          data: this.mediadata
        });
        this.$emit('close', '');

        // if(!this.alt_key_is_pressed) {
        //   this.$emit('close', '');
        // } else {
        //   this.$eventHub.$emit('editmediamodal.nextmedia');
        // }
      }
    },
    setMediaDateTimeline: function(newDate) {
      this.mediadata.date_timeline = newDate;
    },
    editThisMedia: function() {
      console.log('editThisMedia');

      this.$root.editMedia({ 
        type: 'folders',
        slugFolderName: this.slugFolderName, 
        slugMediaName: this.slugMediaName,
        data: this.mediadata
      });

      // then close that popover
      if(!this.alt_key_is_pressed) {
        this.$emit('close', '');
      }
    }
  }
};
</script>
<style>

</style>
