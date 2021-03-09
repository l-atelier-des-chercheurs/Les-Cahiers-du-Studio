<template>
  <Modal
    :backgroundColor="color"
    @close="$emit('close')"
    @submit="editThisMedia"
    @arrow_left="$eventHub.$emit('editmediamodal.previousmedia')"
    @arrow_right="$eventHub.$emit('editmediamodal.nextmedia')"
    :read_only="read_only || !can_edit"
    :typeOfModal="
      media.type !== 'text' ? 'LargeAndNoScroll' : 'LargeAndNoScroll'
    "
    :askBeforeClosingModal="askBeforeClosingModal"
    :show_sidebar="$root.media_modal.show_sidebar"
    :is_minimized="$root.media_modal.minimized"
    :can_minimize="false"
    :arrow_navigation="true"
  >
    <template slot="header">
      <span class="text-cap">{{ $t("edit_the_media") }}</span>
      <br />
      <i>{{ media.media_filename }}</i>
    </template>

    <template slot="sidebar">
      <!-- Caption -->
      <div
        v-if="
          (can_edit || !!mediadata.caption) &&
          mediadata.type !== 'marker' &&
          mediadata.type !== 'text'
        "
        class="margin-bottom-small"
      >
        <label>{{ $t("caption") }}</label>
        <br />
        <textarea
          :class="{ 'is--tall': !!media.caption }"
          v-model="mediadata.caption"
          :readonly="!can_edit"
        ></textarea>
      </div>

      <div class="margin-bottom-small">
        <label>
          {{ $t("date") }}
          <small v-if="can_edit">
            {{ $t("for_the_placement_on_timeline") }}
          </small>
        </label>
        <div>
          <DateTime
            v-model="mediadata.date_timeline"
            :twowaybinding="true"
            :read_only="!can_edit"
          />
          <template v-if="can_edit">
            <div
              class="margin-bottom-verysmall"
              v-if="media.date_created !== undefined"
            >
              <small class="font-verysmall">
                {{ $t("created_date") }}
                <button
                  type="button"
                  class="currentTime_human border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
                  @click="setMediaDateTimeline(media.date_created)"
                >
                  {{ date_created_human }}
                </button>
              </small>
            </div>

            <div
              class="margin-bottom-verysmall"
              v-if="media.date_upload !== undefined"
            >
              <small class="font-verysmall">
                {{ $t("sent_date") }}
                <button
                  type="button"
                  class="button-verysmall border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
                  @click="setMediaDateTimeline(media.date_upload)"
                >
                  {{ date_uploaded_human }}
                </button>
              </small>
            </div>

            <div class="">
              <small class="font-verysmall">
                {{ $t("currently") }}
                <button
                  type="button"
                  class="currentTime_human border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
                  @click="setMediaDateTimeline($root.current_time.seconds)"
                >
                  {{ $root.currentTime_human }}
                </button>
              </small>
            </div>
          </template>
        </div>
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
      </div>-->

      <!-- Color -->
      <!-- <div v-if="!read_only" class="margin-bottom-small">
        <label>{{ $t('color') }}</label>
        <select v-if="!read_only" ref="type" v-model="mediadata.color">
          <option v-for="mediaColor in $root.state.structure['folders'].medias.fields.color.options" :key="mediaColor">
            {{ mediaColor }}
          </option>
        </select>
        <input type="text" v-else :value="mediadata.color" readonly>
      </div>-->

      <!-- Keywords -->

      <div
        v-if="
          (typeof mediadata.keywords === 'object' &&
            !!mediadata.keywords.length > 0) ||
          can_edit
        "
        class="margin-bottom-small"
      >
        <label>{{ $t("keywords") }}</label>
        <TagsInput
          :keywords="!!mediadata.keywords ? mediadata.keywords : []"
          :read_only="read_only || !can_edit"
          @tagsChanged="(newTags) => (mediadata.keywords = newTags)"
        />
      </div>

      <!-- Author(s) -->
      <div v-if="!read_only || !!mediadata.authors" class="margin-bottom-small">
        <label>{{ $t("author") }}</label>
        <AuthorsInput
          :currentAuthors.sync="mediadata.authors"
          :read_only="read_only || !can_edit"
        />
        <small v-html="$t(author_instructions)" />
      </div>

      <!-- Public or private -->
      <div v-if="!read_only && can_edit" class="margin-bottom-small">
        <span class="switch switch-xs">
          <input
            type="checkbox"
            class=""
            id="publicswitch"
            v-model="mediadata.public"
            :readonly="read_only"
          />
          <label for="publicswitch">{{ $t("public") }}</label>
        </span>
      </div>

      <div class="bg-noir padding-veryverysmall" v-if="!!adjust_mode">
        <div v-if="adjust_mode === 'trim'" class="">
          <div class="margin-sides-small margin-vert-verysmall">
            <small>{{ $t("trim_instructions") }}</small>
          </div>
          <div class="flex-wrap flex-space-betwen">
            <div class="margin-small margin-vert-verysmall">
              <label>{{ $t("beginning") }}</label>
              <div class>
                <input
                  type="time"
                  step="0.1"
                  class="bg-blanc"
                  v-model="trim_options.beginning"
                />
              </div>
            </div>
            <div class="margin-small margin-vert-verysmall">
              <label>{{ $t("end") }}</label>
              <div class>
                <input
                  type="time"
                  step="0.1"
                  class="bg-blanc"
                  v-model="trim_options.end"
                />
              </div>
            </div>
          </div>
          <!-- <hr class="margin-vert-small" /> -->
          <div>
            <small v-if="trim_options_valid !== true">
              <span v-html="$t('error:')" />
              {{ trim_options_valid }}
            </small>
          </div>
          <div class="margin-sides-verysmall margin-vert-verysmall">
            <button
              type="button"
              class="button-thin"
              @click="testTrim"
              :disabled="trim_options_valid !== true"
            >
              {{ $t("test") }}
            </button>
            <button
              type="button"
              class="button-greenthin"
              @click="editRawMedia('trim', trim_options)"
              :disabled="trim_options_valid !== true"
            >
              {{ $t("trim") }}
            </button>
          </div>
        </div>
        <div v-else-if="adjust_mode === 'optimize'">
          <div class="padding-sides-small margin-vert-verysmall">
            <small>{{ $t("optimize_instructions") }}</small>
          </div>
          <div class="margin-sides-medium margin-bottom-small">
            <label>{{ $t("quality") }}</label>
            <select v-model="quality" class="bg-blanc">
              <option
                v-for="q in available_qualities"
                :value="q.height"
                :key="q.height"
              >
                {{ $t(q.label) }}
              </option>
            </select>
            <small>{{ quality }}p</small>
          </div>
          <div class="margin-sides-verysmall margin-vert-verysmall">
            <button
              type="button"
              class="border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
              @click="editRawMedia('optimize', { quality })"
            >
              {{ $t("optimize") }}
            </button>
          </div>
        </div>
        <div class="margin-small font-verysmall">
          {{ $t("adjust_infos") }}
        </div>
      </div>

      <div>
        <button
          type="button"
          class="buttonLink"
          @click="editRawMedia('reset')"
          v-if="can_edit && !!media.original_media_filename"
        >
          {{ $t("revert_to_original") }}
        </button>
      </div>

      <div
        class="m_modal--buttonrow flex-wrap flex-vertically-start flex-space-between flex-same-basis"
      >
        <button
          type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
          :class="{ 'is--active': adjust_mode === 'optimize' }"
          @click="toggleAdjustMode('optimize')"
          :disabled="read_only"
          v-if="can_edit && (media.type === 'video' || media.type === 'audio')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 49 49">
            <g id="Calque_2" data-name="Calque 2">
              <g id="Calque_1-2" data-name="Calque 1">
                <g>
                  <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d" />
                  <circle
                    cx="24.5"
                    cy="24.5"
                    r="24"
                    style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                  />
                </g>
                <g>
                  <path
                    d="M21.6257,12.2569a.3441.3441,0,0,1,.243.1049.3511.3511,0,0,1,.0978.246v2.5648h2.5652a.3559.3559,0,0,1,.2479.1.346.346,0,0,1-.2479.5924H21.9665l0,2.5649a.3558.3558,0,0,1-.1.2478.346.346,0,0,1-.5924-.2478V15.8646l-2.57,0a.356.356,0,0,1-.2478-.1.346.346,0,0,1,.2478-.5925h2.57l0-2.5648a.3555.3555,0,0,1,.0256-.1352.3458.3458,0,0,1,.3259-.2157Z"
                    style="
                      fill: #fff;
                      stroke: #fff;
                      stroke-linecap: round;
                      stroke-linejoin: round;
                      stroke-width: 0.4251968503937008px;
                    "
                  />
                  <path
                    d="M16.3733,9.2058a.3449.3449,0,0,1,.2431.1049.35.35,0,0,1,.0977.2461l0,1.2472h1.2427a.3559.3559,0,0,1,.2479.1.3461.3461,0,0,1-.2479.5925H16.7142v1.2472a.3561.3561,0,0,1-.1.2478.3461.3461,0,0,1-.5925-.2478V11.4961H14.7747a.356.356,0,0,1-.2478-.1.346.346,0,0,1,.2478-.5925h1.2474V9.5568a.3613.3613,0,0,1,.0252-.1352.3462.3462,0,0,1,.3259-.2158Z"
                    style="
                      fill: #fff;
                      stroke: #fff;
                      stroke-linecap: round;
                      stroke-linejoin: round;
                      stroke-width: 0.4251968503937008px;
                    "
                  />
                  <path
                    d="M14.252,19.3961a.3442.3442,0,0,1,.243.105.35.35,0,0,1,.0977.246l0,2.5648H17.158a.3555.3555,0,0,1,.2478.1.346.346,0,0,1-.2478.5925H14.5928v2.5648a.3555.3555,0,0,1-.1.2478.346.346,0,0,1-.5924-.2478l0-2.5648H11.3356a.3563.3563,0,0,1-.2478-.1.3461.3461,0,0,1,.2478-.5925h2.5651V19.7471a.3609.3609,0,0,1,.0252-.1352.3464.3464,0,0,1,.326-.2158Z"
                    style="
                      fill: #fff;
                      stroke: #fff;
                      stroke-linecap: round;
                      stroke-linejoin: round;
                      stroke-width: 0.4251968503937008px;
                    "
                  />
                  <path
                    d="M10.2894,15.677a.3441.3441,0,0,1,.243.1049.35.35,0,0,1,.0978.2461v1.2472h1.2474a.3559.3559,0,0,1,.2479.1.3461.3461,0,0,1-.2479.5925H10.63l0,1.2471a.3562.3562,0,0,1-.1.2479.3461.3461,0,0,1-.5925-.2478V17.9673H8.6907a.356.356,0,0,1-.2479-.1.346.346,0,0,1,.2479-.5924H9.9382V16.028a.3609.3609,0,0,1,.0252-.1352.3462.3462,0,0,1,.3258-.2158Z"
                    style="
                      fill: #fff;
                      stroke: #fff;
                      stroke-linecap: round;
                      stroke-linejoin: round;
                      stroke-width: 0.4251968503937008px;
                    "
                  />
                  <path
                    d="M12.5316,12.9851l-.6693.6693L36.345,38.1337l.6694-.6693Z"
                    style="
                      fill: #fff;
                      stroke: #fff;
                      stroke-linecap: round;
                      stroke-linejoin: round;
                      stroke-width: 0.4251968503937008px;
                    "
                  />
                </g>
              </g>
            </g>
          </svg>

          <span class="text-cap font-verysmall">{{ $t("optimize") }}</span>
        </button>

        <button
          type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
          :class="{ 'is--active': adjust_mode === 'trim' }"
          @click="toggleAdjustMode('trim')"
          :disabled="read_only"
          v-if="can_edit && (media.type === 'video' || media.type === 'audio')"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="49px"
            height="49px"
            viewBox="0 0 49 49"
            style="overflow: visible; enable-background: new 0 0 49 49"
            xml:space="preserve"
          >
            <g style="fill: none; stroke: #fff; stroke-miterlimit: 10">
              <circle class="st0" cx="24.5" cy="24.5" r="24" />
              <circle class="st1" cx="24.5" cy="24.5" r="24" />
            </g>
            <g transform="translate(0,-952.36223)">
              <g
                style="fill: #fff"
                transform="matrix(0.57102328,0.57102328,-0.57102328,0.57102328,41.282122,516.73012)"
              >
                <path
                  class="st2"
                  d="M405.2,399.7c-0.2,0-0.4,0.1-0.6,0.3l-4.9,4.9v-3.1c0-0.2-0.1-0.4-0.2-0.6c-0.3-0.3-0.9-0.3-1.2,0
			c-0.2,0.2-0.2,0.4-0.2,0.6v4.9c-0.1,0.3,0,0.6,0.2,0.8c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0c0.2,0.2,0.5,0.3,0.8,0.2
			h4.9c0.5,0,0.8-0.4,0.9-0.8c0-0.2-0.1-0.5-0.3-0.6c-0.2-0.1-0.4-0.2-0.6-0.2H401l4.9-4.9c0.3-0.3,0.3-0.9,0-1.2c0,0,0,0,0,0
			C405.7,399.8,405.4,399.7,405.2,399.7z M396.7,408.2c-0.2,0-0.4,0.1-0.6,0.3l-17,17c-0.3,0.3-0.4,0.8,0,1.2c0.3,0.3,0.8,0.4,1.2,0
			c0,0,0,0,0,0l17-17c0.3-0.3,0.3-0.9,0-1.2c0,0,0,0,0,0C397.1,408.3,396.9,408.2,396.7,408.2z M377.5,427.5c0,0-0.1,0-0.1,0h-5
			c-0.5,0-0.8,0.4-0.9,0.8c0,0.5,0.4,0.8,0.8,0.9c0,0,0,0,0,0h3.1l-4.9,4.9c-0.3,0.3-0.3,0.9,0,1.2s0.9,0.3,1.2,0l4.9-4.9v3.1
			c0,0.5,0.4,0.8,0.8,0.9c0.5,0,0.8-0.4,0.9-0.8c0,0,0,0,0,0v-5c0-0.1,0-0.3,0-0.4c0-0.1-0.1-0.2-0.2-0.3c-0.1-0.1-0.1-0.1-0.2-0.1
			c0,0,0,0,0,0c0,0,0,0-0.1,0c0,0,0,0,0,0c0,0,0,0,0,0C377.7,427.5,377.6,427.5,377.5,427.5z"
                />
              </g>
            </g>
          </svg>

          <span class="text-cap font-verysmall">{{ $t("trim") }}</span>
        </button>

        <button
          type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
          @click="removeMedia()"
          :disabled="read_only"
          v-if="can_edit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="49"
            height="49"
            viewBox="0 0 49 49"
          >
            <g id="Calque_2" data-name="Calque 2">
              <g id="Editeur_txt" data-name="Editeur txt">
                <g>
                  <g>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d" />
                    <circle
                      cx="24.5"
                      cy="24.5"
                      r="24"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                  </g>
                  <g>
                    <path
                      d="M16.79,35.19l-.72-16.86H33l-.72,16.86a1.42,1.42,0,0,1-1.46,1.31H18.25A1.42,1.42,0,0,1,16.79,35.19Z"
                      style="fill: #4d4d4d; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <path
                      d="M20.83,15.41v-2a.89.89,0,0,1,.92-.86h5.52a.89.89,0,0,1,.92.86v2Z"
                      style="fill: #4d4d4d; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <line
                      x1="20.75"
                      y1="34.18"
                      x2="20.75"
                      y2="21.01"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <line
                      x1="24.66"
                      y1="34.18"
                      x2="24.66"
                      y2="21.01"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <line
                      x1="28.58"
                      y1="34.18"
                      x2="28.58"
                      y2="21.01"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <line
                      x1="14"
                      y1="15.41"
                      x2="35"
                      y2="15.41"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                  </g>
                </g>
              </g>
            </g>
          </svg>

          <span class="text-cap font-verysmall">{{ $t("remove") }}</span>
        </button>

        <!-- <button
          type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
          @click.prevent="printMedia()"
          v-if="can_edit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="49"
            height="49"
            viewBox="0 0 49 49"
          >
            <g id="Calque_2" data-name="Calque 2">
              <g id="Editeur_txt" data-name="Editeur txt">
                <g>
                  <g>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d" />
                    <circle
                      cx="24.5"
                      cy="24.5"
                      r="24"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                  </g>
                  <g>
                    <rect
                      x="12.5"
                      y="18.57"
                      width="24"
                      height="12.78"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <polyline
                      points="16.83 18.57 16.83 15.54 20.38 12.03 32.17 12.03 32.17 18.57"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <rect
                      x="16.83"
                      y="25.95"
                      width="15.33"
                      height="10.08"
                      style="fill: #4d4d4d; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <line
                      x1="19.12"
                      y1="29.29"
                      x2="29.53"
                      y2="29.29"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <line
                      x1="19.12"
                      y1="32.17"
                      x2="29.53"
                      y2="32.17"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <line
                      x1="14.11"
                      y1="25.95"
                      x2="34.86"
                      y2="25.95"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <ellipse
                      cx="32.37"
                      cy="22.15"
                      rx="0.75"
                      ry="0.74"
                      style="fill: #fff; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <polyline
                      points="20.02 11.99 20.02 15.49 16.52 15.49"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                  </g>
                </g>
              </g>
            </g>
          </svg>
          <span class="text-cap font-verysmall">{{ $t("print") }}</span>
        </button> -->

        <template v-if="showQRModal">
          <hr />
          <CreateQRCode
            :slugFolderName="slugFolderName"
            :media_filename="media.media_filename"
          />
        </template>

        <button
          type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
          @click="showQRModal = !showQRModal"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="49px"
            height="49px"
            viewBox="0 0 49 49"
            style="enable-background: new 0 0 49 49"
            xml:space="preserve"
          >
            <g>
              <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d" />
              <circle
                cx="24.5"
                cy="24.5"
                r="24"
                style="fill: none; stroke: #fff; stroke-miterlimit: 10"
              />
            </g>
            <path
              style="fill: none; stroke: #fff; stroke-miterlimit: 10"
              d="M25.7,14v9.2H35V14H25.7z M16.7,32.3h3.9v-3.9h-3.9V32.3z M14,35h9.2v-9.2H14V35z M14,23.3h9.2V14H14V23.3z
              M29,25.7h-3.3v2.9H29V25.7z M30.4,27.1h1.8v1.5h-1.8v2.6h-1.8v-1.8h-2v1.8h1.1v2h-2V35h4.6v-1.8h2.9v-2h-1.1v-1.8H35v-3.7h-4.6
              V27.1z M35,35v-1.8h-1.8V35H35z M16.7,20.6h3.9v-3.9h-3.9V20.6z M32.3,16.7h-3.9v3.9h3.9V16.7z"
            />
          </svg>
          <span class="text-cap font-verysmall">Partage</span>
        </button>

        <!-- <a :href="mediaURL" :title="media.media_filename" target="_blank"
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
        </a>-->

        <a
          :download="media.media_filename"
          :href="mediaURL"
          :title="media.media_filename"
          target="_blank"
          class="button bg-transparent button-round margin-verysmall padding-verysmall"
          v-if="
            can_edit &&
            ($root.state.mode !== 'export_web' ||
              ($root.state.hasOwnProperty('export_options') &&
                $root.state.export_options.allow_download !== 'false'))
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="49"
            height="49"
            viewBox="0 0 49 49"
          >
            <g id="Calque_2" data-name="Calque 2">
              <g id="Editeur_txt" data-name="Editeur txt">
                <g>
                  <g>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d" />
                    <circle
                      cx="24.5"
                      cy="24.5"
                      r="24"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                  </g>
                  <g>
                    <polyline
                      points="33.12 20.63 24.5 28.82 15.88 20.63"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                    <line
                      x1="24.5"
                      y1="28.82"
                      x2="24.5"
                      y2="12.53"
                      style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                    />
                  </g>
                  <line
                    x1="13.26"
                    y1="34.05"
                    x2="35.74"
                    y2="34.05"
                    style="fill: none; stroke: #fff; stroke-miterlimit: 10"
                  />
                </g>
              </g>
            </g>
          </svg>
          <span class="text-cap font-verysmall">{{ $t("download") }}</span>
        </a>
      </div>
    </template>

    <template slot="submit_button">
      <template v-if="!alt_key_is_pressed">{{ $t("save_and_close") }}</template>
      <template v-else>{{ $t("save") }}</template>
    </template>

    <template slot="preview">
      <MediaContent
        :context="can_edit ? 'edit' : 'full'"
        :slugMediaName="slugMediaName"
        :slugFolderName="slugFolderName"
        :media="media"
        :mediaURL="mediaURL"
        :read_only="read_only"
        v-model="mediadata.content"
        @videoTimeUpdated="videoTimeUpdated"
      ></MediaContent>
      <div class="m_mediaOptions" v-if="adjust_mode === 'trim'">
        <div class="">
          <label class="padding-sides-verysmall">{{ $t("playback") }}</label>
          <div
            class="flex-wrap flex-horizontally-start flex-no-grow padding-sides-verysmall"
          >
            <input
              type="time"
              step="0.1"
              class="bg-blanc tiny-width input-xs"
              v-model="current_video_time"
            />

            <button
              type="button"
              class="button-thin bg-orange"
              @click="rewindPlayer"
            >
              -1 sec
            </button>
            <button
              type="button"
              class="button-thin bg-orange"
              @click="forwardPlayer"
            >
              +1 sec
            </button>
          </div>
          <label class="padding-sides-verysmall">{{ $t("trim_help") }}</label>
          <div>
            <button
              type="button"
              class="border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
              :disabled="current_video_time === trim_options.beginning"
              @click="trim_options.beginning = current_video_time"
            >
              {{ $t("set_as_beginning") }}
              ({{ trim_options.beginning }} → {{ current_video_time }})
            </button>
            <button
              type="button"
              class="border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
              :disabled="current_video_time === trim_options.end"
              @click="trim_options.end = current_video_time"
            >
              {{ $t("set_as_end") }}
              ({{ trim_options.end }} → {{ current_video_time }})
            </button>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>
<script>
import alertify from "alertify.js";
import MediaContent from "../subcomponents/MediaContent.vue";
import DateTime from "../subcomponents/DateTime.vue";
import AuthorsInput from "../subcomponents/AuthorsInput.vue";
import TagsInput from "../subcomponents/TagsInput.vue";
import CreateQRCode from "./../qr/CreateQRCode.vue";

export default {
  props: {
    slugFolderName: String,
    slugMediaName: String,
    media: Object,
    folder: Object,
    read_only: {
      type: Boolean,
      default: true,
    },
    can_edit: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    DateTime,
    MediaContent,
    AuthorsInput,
    TagsInput,
    CreateQRCode,
  },
  data() {
    return {
      mediadata: {
        date_timeline: this.media.date_timeline,
        type: this.media.type,
        // color: this.media.color,
        authors: this.media.authors,
        caption: this.media.caption,
        keywords:
          typeof this.media.keywords === "object"
            ? this.media.keywords
            : typeof this.media.keywords === "string" && !!this.media.keywords
            ? [{ title: this.media.keywords }]
            : [],
        public: this.media.public,
        content: this.media.content,
      },
      mediaURL:
        this.$root.state.mode === "export_web"
          ? `./${this.slugFolderName}/${this.media.media_filename}`
          : `/${this.slugFolderName}/${this.media.media_filename}`,
      alt_key_is_pressed: false,
      askBeforeClosingModal: false,
      showQRModal: false,

      trim_options: {
        beginning: "",
        end: "",
      },
      current_video_time: "00:00:00",

      adjust_mode: false,

      quality: 720,
      available_qualities: [
        {
          label: "very_high",
          height: 1080,
        },
        {
          label: "high",
          height: 720,
        },
        {
          label: "medium",
          height: 480,
        },
        {
          label: "low",
          height: 360,
        },
      ],
    };
  },
  watch: {
    mediadata: {
      handler() {
        this.askBeforeClosingModal = true;
      },
      deep: true,
    },
    "trim_options.beginning"() {
      if (this.trim_options.beginning === "")
        this.trim_options.beginning = "00:00:00";
    },
    "trim_options.end"() {
      if (this.trim_options.end === "")
        this.trim_options.end = this.$root.formatDurationToHoursMinutesSeconds(
          this.media_duration * 1000
        );
    },
    adjust_mode() {
      if (this.adjust_mode === "trim") {
        debugger;
        this.trim_options.beginning = "00:00:00";
        this.trim_options.end = this.$root.formatDurationToHoursMinutesSeconds(
          this.media_duration * 1000
        );
      }
    },
  },
  mounted() {
    // document.addEventListener('keyup', this.keyPressed);
  },
  beforeDestroy: function () {
    // document.removeEventListener('keyup', this.keyPressed);
  },
  computed: {
    date_created_human() {
      return this.$moment(this.media.date_created).format("l LTS");
    },
    date_uploaded_human() {
      return this.$moment(this.media.date_upload).format("l LTS");
    },
    trim_options_valid() {
      const _beginning = +this.$moment.duration(this.trim_options.beginning);
      const _end = +this.$moment.duration(this.trim_options.end);
      const _duration = +this.$moment.duration(this.media_duration * 1000);

      debugger;

      // if beginning is after clip end
      if (_beginning >= _end)
        return `${this.$t("beginning")} >= ${this.$t("end")}`.toLowerCase();

      // if beginning is after trim end
      if (_duration && _beginning > _duration)
        return `${this.$t("beginning")} > ${this.$t("duration")}`.toLowerCase();

      if (_duration && _end > _duration)
        return `${this.$t("end")} > ${this.$t("duration")}`.toLowerCase();

      // if end is before start
      if (_end < 0) return `${this.$t("end")} < 0`.toLowerCase();

      return true;
    },
    media_duration: function () {
      if (
        !this.media.hasOwnProperty("duration") &&
        !(
          this.media.hasOwnProperty("file_meta") &&
          this.media.file_meta.some((f) => f.hasOwnProperty("duration"))
        )
      )
        return false;

      const duration = this.media.hasOwnProperty("duration")
        ? this.media.duration
        : this.media.file_meta.find((f) => f.hasOwnProperty("duration"))
            .duration;
      return duration;
    },

    color() {
      const media_authors = this.mediadata.authors;
      if (
        typeof media_authors !== "object" ||
        media_authors.length == 0 ||
        typeof this.folder.authors !== "object" ||
        this.folder.authors.length == 0
      ) {
        return "";
      }
      const full_authors_info = this.folder.authors.filter(
        (a) => a.name === media_authors[0].name
      );
      if (full_authors_info.length == 0) {
        return "";
      }
      return full_authors_info[0].color;
    },
  },
  methods: {
    keyPressed: function (event) {
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
    printMedia: function () {
      window.print();
    },
    openMediaNewWindow: function () {},
    removeMedia: function () {
      if (window.confirm(this.$t("sureToRemoveMedia"))) {
        this.$root.removeMedia({
          type: "folders",
          slugFolderName: this.slugFolderName,
          slugMediaName: this.slugMediaName,
          data: this.mediadata,
        });
        this.$emit("close", "");

        // if(!this.alt_key_is_pressed) {
        //   this.$emit('close', '');
        // } else {
        //   this.$eventHub.$emit('editmediamodal.nextmedia');
        // }
      }
    },
    setMediaDateTimeline: function (newDate) {
      this.mediadata.date_timeline = newDate;
    },
    editThisMedia: function () {
      console.log("editThisMedia");

      this.$root.editMedia({
        type: "folders",
        slugFolderName: this.slugFolderName,
        slugMediaName: this.slugMediaName,
        data: this.mediadata,
      });

      // then close that popover
      if (!this.alt_key_is_pressed) {
        this.$emit("close", "");
      }
    },

    toggleAdjustMode(new_mode) {
      if (new_mode === this.adjust_mode) this.adjust_mode = false;
      else this.adjust_mode = new_mode;
    },
    videoTimeUpdated(currentTime) {
      this.current_video_time = this.$moment
        .utc(currentTime * 1000)
        .format("HH:mm:ss.SS");
    },

    testTrim() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`EditMedia • METHODS: testTrim`);

      const player = document.querySelector(".m_modal--mask .plyr video");

      const start_seconds = this.$moment
        .duration(this.trim_options.beginning)
        .asSeconds();
      const end_seconds = this.$moment
        .duration(this.trim_options.end)
        .asSeconds();

      player.currentTime = start_seconds;
      player.play();

      const pausing_function = function () {
        if (player.currentTime >= end_seconds) {
          player.pause();
          // player.removeEventListener("timeupdate", pausing_function);
        } else {
          window.requestAnimationFrame(pausing_function);
        }
      };
      window.requestAnimationFrame(pausing_function);
      // player.addEventListener("timeupdate", pausing_function, false);
    },
    forwardPlayer() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`EditMedia • METHODS: forwardPlayer`);
      const player = document.querySelector(".m_modal--mask .plyr video");
      player.plyr.forward(1);
    },
    rewindPlayer() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`EditMedia • METHODS: rewindPlayer`);
      const player = document.querySelector(".m_modal--mask .plyr video");
      player.plyr.rewind(1);
    },

    editRawMedia: function (type, detail) {
      console.log("editRawMedia");
      this.is_loading_or_saving = true;

      this.$root
        .editMedia({
          type: "folders",
          slugFolderName: this.slugFolderName,
          slugMediaName: this.slugMediaName,
          // data: this.mediadata,
          recipe_with_data: {
            apply_to: this.media.media_filename,
            type,
            detail,
          },
        })
        .then((mdata) => {
          this.is_loading_or_saving = false;
          this.adjust_mode = false;
          // this.show_saved_icon = true;
          // setTimeout(() => {
          //   this.show_saved_icon = false;
          // }, 200);
        });
    },
  },
};
</script>
<style lang="scss">
.m_mediaOptions {
  position: absolute;
  bottom: 0;
  z-index: 100;
  background-color: white;
  margin: 60px 10px;

  padding: calc(var(--spacing) / 4);
  border: 1px solid black;

  /* padding: 15px; */
}

.m_modal--buttonrow.is--active {
}
</style>
