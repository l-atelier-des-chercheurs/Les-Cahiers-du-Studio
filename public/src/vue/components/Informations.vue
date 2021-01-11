<template>
  <div class="m_informations">
    <button
      type="button"
      class="button-nostyle _close_button"
      @click="$emit('close')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 48 48"
      >
        <line x1="24" y1="24" x2="34.67" y2="34.67" />
        <line x1="24" y1="24" x2="34.67" y2="13.33" />
      </svg>
    </button>
    <div class="m_informations--presentation">
      <div v-if="false">
        <label>
          <!-- <h3 class="margin-none text-cap with-bullet">{{ $t("lang") }}</h3> -->
          <select v-model="currentLang" style="max-width: 11ch">
            <option
              v-for="(name, code) in $root.lang.available"
              :value="code"
              :key="code"
            >
              {{ name }}
            </option>
          </select>
        </label>
      </div>

      <div class="m_informations--presentation--text">
        <template v-if="$root.lang.current === 'fr'">
          <h1>
            <img
              src="/images/logo-afd.svg"
              width="200"
              alt="Logo point commun."
            />
          </h1>
        </template>

        <br />

        <h2>créer du lien par le design</h2>

        <template v-if="$root.lang.current === 'fr'">
          <p>
            Soucieux de donner la parole aux designers favorisant du bien
            commun, Silvia Dore organise en binôme avec Romain Diant
            l’exposition « Point Commun ». Rendez-vous annuel orchestré par
            l’Alliance France Design, « Point Commun » permet de questionner la
            position du designer dans la société, ce dans un monde remis en
            question par une pandémie sans commune mesure, et d’ouvrir le
            dialogue au delà de la sphère des designers.
          </p>

          <blockquote class="t-indent">
            Ouvrons le débat, partageons nos idées et nos projets, créons à
            partir de nos pluralités des futurs communs.
          </blockquote>
        </template>

        <div class="t-indent">
          <button
            type="button"
            class="_unfold_button"
            :class="{ 'is--active': show_detail }"
            @click="show_detail = !show_detail"
          >
            <template v-if="!show_detail">►</template>
            <template v-else>▼</template>
            <template v-if="$root.lang.current === 'fr'">
              plus d’informations…
            </template>
            <template v-else>more informations… </template>
          </button>

          <p v-if="show_detail">
            <template v-if="$root.lang.current === 'fr'">
              Sur une initiative de Silvia Dore, co-organisation avec Romain
              Diant.
            </template>
            <template v-else> </template>
          </p>

          <h3>
            <span
              >Care
              <svg
                class="_picto-bg"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width="94.6px"
                height="33.9px"
                viewBox="0 0 94.6 33.9"
                style="overflow: visible; enable-background: new 0 0 94.6 33.9"
                xml:space="preserve"
              >
                <path
                  class="st0"
                  style="fill: #059cf5"
                  d="M82.7,33.9c6.9,0,11.9-5.1,11.9-11.8c0-4.3-2.3-8.1-5.8-10.3C86.9,10.7,47.3,0,47.3,0S7.7,10.8,5.8,12
	C2.3,14.1,0,17.9,0,22.2c0,6.7,5.2,11.6,12,11.6L82.7,33.9z"
                />
              </svg>
            </span>
          </h3>

          <p class="f-compagnie">
            Michela Deni (PROJEKT)<br />
            Ruedi Baur (Integral designers)<br />
            Cécile Duval-Zack (AIA LifeDesigners)<br />
            Pierre Cloarec (ENSCI)<br />
            Sophie Larger et Vincent Lacoste
          </p>

          <h3>
            <span>Territoires </span>
          </h3>

          <p class="f-compagnie">
            Ludovic Duhem (ESAD Valenciennes)<br />
            Malte Martin (agrafmobile)<br />
            Émeline Lavocat (27e Région)<br />
            Yann Aucompte et Matthieu Marchal<br />
            Fanny Ehl - Doctorante à l’université Lyon 2 en géographie
          </p>

          <h3>
            <span
              >Ressources
              <svg
                class="_picto-bg"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width="111px"
                height="44.9px"
                viewBox="0 0 111 44.9"
                style="overflow: visible; enable-background: new 0 0 111 44.9"
                xml:space="preserve"
              >
                <path
                  style="fill: #059cf5"
                  d="M111,21.5L94.5,0c0,0-19.4,7.3-39,7.3S16.6,0,16.6,0L0,21.5l16.6,23.4c8.4-5.2,22.3-9,38.9-9
	c16.6,0,30.6,3.8,39,9L111,21.5z"
                />
              </svg>
            </span>
          </h3>

          <p class="f-compagnie">
            Florian Dach et Dimitri Zephir (dach&zephir / Éloj Kréyol) <br />
            et Sophie Krier (Field Essays/Plateforme “art, design et société”
            EnsadLab)<br />
            Christophe Tincelin et Nicolas Chauveau (Entreautre)<br />
            Flora Koel et Alexandre Echasseriau<br />
            Miren Lasnier (ENSCI)
          </p>

          <h3>
            <span
              >Communs

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 482.5766 125.8895"
                class="_picto-bg"
              >
                <path
                  d="M241.2883,125.89c133.2582,0,241.2883-28.1824,241.2883-62.9447S374.5465,0,241.2883,0,0,28.1825,0,62.9448,108.03,125.89,241.2883,125.89"
                  style="fill: #059cf5"
                />
              </svg>
            </span>
          </h3>

          <p class="f-compagnie">
            Jérôme Delormas (ISDAT Toulouse) <br />
            Eddy Terki et Alice Cornu (Plateforme social design) <br />
            Juliette Chevalier (chargée mission design et mode Ministère de la
            culture)<br />
            Pauline Gourlet et Sylvia Fredriksson (Design commun)<br />
            Lyne EA (HEAR)<br />
            Silvia Dore et Romain Diant (AFD)
          </p>
        </div>

        <img src="/images/schema-afd.svg" width="200" />

        <h2>Merci à tous ceux qui nous soutiennent</h2>
        <img src="/images/logos-afd.svg" width="200" />

        <div class="_signature">
          <p>
            Alliance France Design, <br />
            11, rue Belzunce, Paris 09
          </p>
          <div class="_picto_sociaux">
            <a
              href="https://www.facebook.com/ExpositionPointCommun"
              target="_blank"
              title="Exposition point commun sur facebook"
            >
              <svg class="svg-icon" viewBox="0 0 20 20">
                <path
                  fill="none"
                  d="M10,0.5c-5.247,0-9.5,4.253-9.5,9.5c0,5.247,4.253,9.5,9.5,9.5c5.247,0,9.5-4.253,9.5-9.5C19.5,4.753,15.247,0.5,10,0.5 M10,18.637c-4.77,0-8.636-3.867-8.636-8.637S5.23,1.364,10,1.364S18.637,5.23,18.637,10S14.77,18.637,10,18.637 M10.858,7.949c0-0.349,0.036-0.536,0.573-0.536h0.719v-1.3H11c-1.38,0-1.866,0.65-1.866,1.743v0.845h-0.86V10h0.86v3.887h1.723V10h1.149l0.152-1.299h-1.302L10.858,7.949z"
                ></path>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/alliancefrancedesign"
              target="_blank"
              title="AFD sur Instagram"
            >
              <svg class="svg-icon" viewBox="0 0 20 20">
                <path
                  fill="none"
                  d="M9.969,0.594c-5.195,0-9.406,4.211-9.406,9.406c0,5.195,4.211,9.406,9.406,9.406c5.195,0,9.406-4.211,9.406-9.406C19.375,4.805,15.164,0.594,9.969,0.594 M9.969,18.552c-4.723,0-8.551-3.829-8.551-8.552s3.829-8.551,8.551-8.551S18.521,5.277,18.521,10S14.691,18.552,9.969,18.552 M12.534,5.724H7.403c-0.944,0-1.71,0.766-1.71,1.71v5.131c0,0.944,0.766,1.71,1.71,1.71h5.131c0.944,0,1.71-0.766,1.71-1.71V7.435C14.244,6.49,13.479,5.724,12.534,5.724M11.679,7.007h1.283V8.29h-1.283V7.007z M9.969,8.29c0.944,0,1.71,0.766,1.71,1.71s-0.766,1.71-1.71,1.71s-1.71-0.766-1.71-1.71S9.024,8.29,9.969,8.29 M13.39,12.565c0,0.472-0.384,0.854-0.855,0.854H7.403c-0.472,0-0.855-0.383-0.855-0.854V9.573h0.898C7.423,9.712,7.403,9.854,7.403,10c0,1.417,1.149,2.565,2.565,2.565c1.416,0,2.565-1.148,2.565-2.565c0-0.146-0.02-0.288-0.043-0.427h0.898V12.565z"
                ></path>
              </svg>
            </a>
          </div>
        </div>
        <div>
          <div>
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="107.3px"
              height="58.6px"
              viewBox="0 0 107.3 58.6"
              style="
                overflow: visible;
                enable-background: new 0 0 107.3 58.6;
                fill: var(--color-rouge_vif);
              "
              xml:space="preserve"
            >
              <g>
                <path
                  class="st0"
                  d="M34.3,37.2l-3.8,4.1c0,0-2-2.5-6.3-6.8S17.6,28,17.6,28l4.2-3.7c3.4-3.5,9-3.6,12.5-0.1
		c0.1,0.1,0.1,0.1,0.2,0.2C37.9,27.9,37.9,33.6,34.3,37.2C34.4,37.1,34.4,37.2,34.3,37.2 M40.8,18.6c-6.8-7-18-7.3-25-0.5
		c-0.1,0.1-0.3,0.3-0.4,0.4L0,32.7l6.7,6.6l4.2-4.5c2.4,2,4.7,4.1,6.9,6.4c4.2,4.3,6.3,6.3,6.3,6.3l-5,4.7l4.9,4.6
		c-4.8,0.1-10.8,0.4-14.3,0.7v1h28.4v-1c-3.2-0.3-6.8-0.6-10.9-0.7l12.9-13.2C47.2,36.5,47.9,25.7,40.8,18.6"
                />
                <path
                  class="st0"
                  d="M99.7,55.1V49c0.1-0.5-0.1-1.1-0.5-1.5c-0.4-0.3-0.9-0.5-1.3-0.4c-0.4,0-0.7,0.1-1.1,0.2
		c-0.5,0.1-1,0.4-1.5,0.7h-0.1v-0.7h-1.8v7.8h1.8v-5.8c0.3-0.2,0.7-0.3,1-0.4c0.3-0.1,0.7-0.1,1-0.1c0.2,0,0.4,0,0.6,0.2
		c0.1,0.2,0.2,0.3,0.1,0.5v5.6H99.7z M88.9,50.8c-0.3,0.3-0.6,0.4-1,0.3c-0.3,0-0.7-0.1-0.9-0.3c-0.2-0.3-0.3-0.7-0.3-1.1
		c0-0.4,0.1-0.8,0.3-1.1c0.3-0.2,0.6-0.3,1-0.3c0.4,0,0.7,0.1,1,0.3c0.3,0.3,0.4,0.7,0.3,1.1c0,0.4-0.1,0.7-0.3,1 M89.7,56.8
		c-0.5,0.2-1,0.3-1.5,0.3c-0.4,0-0.8,0-1.2-0.2c-0.2-0.2-0.4-0.4-0.3-0.7c0-0.2,0-0.3,0.1-0.5c0.1-0.2,0.2-0.4,0.3-0.6h0.5h0.6h0.7
		h0.6h0.4c0.1,0,0.2,0,0.3,0.1c0.1,0.1,0.1,0.1,0.2,0.2c0,0.1,0,0.2,0,0.3C90.2,56.1,90,56.5,89.7,56.8 M91.6,54.6
		c-0.1-0.2-0.2-0.5-0.4-0.6c-0.2-0.2-0.4-0.3-0.7-0.3c-0.3-0.1-0.6-0.1-0.8-0.1l-2.5-0.1c-0.1,0-0.2,0-0.3-0.1c0,0-0.1-0.1-0.1-0.2
		c0-0.1,0-0.2,0.1-0.4c0-0.2,0.1-0.4,0.2-0.6c0.1,0,0.3,0.1,0.4,0.1c0.2,0,0.3,0,0.5,0c0.4,0,0.8,0,1.2-0.1c0.3-0.1,0.7-0.2,0.9-0.4
		c0.3-0.2,0.5-0.5,0.6-0.8c0.1-0.4,0.2-0.7,0.2-1.1c0-0.2,0-0.5-0.1-0.7c-0.1-0.2-0.2-0.4-0.3-0.6v-0.1h1l0.2-1.3h-2.6
		c-0.2,0-0.4-0.1-0.6-0.1c-0.2,0-0.4,0-0.6,0c-0.8-0.1-1.6,0.2-2.2,0.7c-0.5,0.5-0.8,1.2-0.7,1.9c0,0.4,0.1,0.8,0.2,1.2
		c0.1,0.3,0.4,0.6,0.6,0.8c-0.2,0.7-0.3,1.2-0.4,1.6c-0.1,0.3-0.1,0.5-0.1,0.8c0,0.2,0,0.3,0.2,0.5c0.1,0.1,0.3,0.2,0.4,0.2v0.1
		c-0.3,0.2-0.5,0.5-0.7,0.9c-0.1,0.3-0.2,0.6-0.2,0.9c-0.1,0.6,0.2,1.1,0.7,1.5c0.7,0.4,1.4,0.5,2.2,0.5c0.6,0,1.1-0.1,1.6-0.2
		c0.4-0.1,0.8-0.3,1.2-0.6c0.3-0.2,0.6-0.6,0.7-0.9c0.2-0.4,0.3-0.8,0.3-1.2C91.7,55.3,91.6,55,91.6,54.6 M82.7,44.2
		C82.5,44,82.3,43.9,82,44c-0.3,0-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,0.8c0,0.3,0.1,0.6,0.3,0.8c0.2,0.2,0.5,0.3,0.8,0.3
		c0.3,0,0.6-0.1,0.8-0.3c0.2-0.2,0.3-0.5,0.3-0.8C83.1,44.7,82.9,44.4,82.7,44.2 M82.9,47.3h-1.8v7.8h1.8L82.9,47.3z M78.8,51.5
		c-0.3-0.3-0.7-0.6-1.1-0.7l-1.2-0.4L76,50.1c-0.1,0-0.2-0.1-0.3-0.2c-0.1,0-0.1-0.1-0.2-0.2c0-0.1,0-0.2,0-0.3
		c0-0.3,0.1-0.5,0.3-0.7c0.2-0.1,0.5-0.2,0.7-0.2h0.3h0.4l0.6,0.1l0.8,0.2l0.3-1.5c-0.4-0.1-0.9-0.1-1.3-0.2c-0.3,0-0.6,0-0.9,0
		c-0.4,0-0.8,0-1.1,0.2c-0.3,0.1-0.6,0.3-0.9,0.5c-0.3,0.2-0.5,0.5-0.6,0.8c-0.2,0.3-0.2,0.7-0.2,1.1c0,0.4,0.1,0.8,0.4,1.2
		c0.3,0.3,0.6,0.6,1.1,0.7l1.2,0.4c0.3,0.1,0.6,0.2,0.8,0.4c0.1,0.1,0.2,0.4,0.2,0.6c0,0.2-0.1,0.5-0.3,0.6
		c-0.2,0.1-0.5,0.2-0.7,0.2h-0.3c-0.1,0-0.3,0-0.4-0.1l-0.7-0.2l-1-0.2l-0.3,1.4l0.9,0.2l0.7,0.1l0.5,0.1c0.2,0,0.3,0,0.5,0
		c0.7,0,1.4-0.2,2-0.6c0.5-0.5,0.8-1.1,0.8-1.8C79.2,52.3,79,51.8,78.8,51.5 M69.6,50.5h-0.8h-0.8c0-0.3,0-0.7,0.1-1
		c0-0.2,0.1-0.5,0.3-0.7c0.1-0.2,0.2-0.3,0.4-0.3c0.2-0.1,0.4-0.1,0.6-0.1c0.3,0,0.7,0.1,0.9,0.3c0.2,0.3,0.3,0.7,0.3,1.2v0.2
		c0,0.1,0,0.2,0,0.3L69.6,50.5 M71.8,53.1c-0.4,0.1-0.7,0.2-1,0.3l-0.7,0.2l-0.4,0.1h-0.3c-0.2,0-0.5,0-0.7-0.1
		c-0.2-0.1-0.4-0.2-0.5-0.3c-0.1-0.2-0.2-0.4-0.3-0.6c-0.1-0.3-0.1-0.7-0.1-1h1.3h1.4l1.6,0c0-0.2,0-0.5,0-0.8s0-0.4,0-0.6
		c0.1-0.9-0.2-1.7-0.8-2.3c-0.6-0.5-1.3-0.8-2-0.8c-0.9-0.1-1.8,0.3-2.4,1c-0.7,0.9-1,2.1-0.9,3.2c-0.1,1.1,0.2,2.1,0.8,3
		c0.7,0.7,1.6,1.1,2.6,1c0.3,0,0.7,0,1-0.1c0.5-0.1,1.1-0.3,1.6-0.4L71.8,53.1z M62.3,51.5c-0.1,0.4-0.2,0.8-0.5,1.2
		c-0.2,0.3-0.5,0.5-0.8,0.6c-0.4,0.1-0.8,0.2-1.2,0.2h-1.5v-7.5h1.5c0.3,0,0.7,0,1,0.1c0.3,0.1,0.6,0.3,0.8,0.5
		c0.2,0.3,0.4,0.7,0.5,1.1c0.1,0.6,0.2,1.2,0.2,1.8C62.4,50.2,62.3,50.9,62.3,51.5 M64.1,47.1c-0.2-0.6-0.5-1.2-1-1.6
		c-0.4-0.4-0.9-0.7-1.5-0.9c-0.6-0.2-1.2-0.3-1.9-0.3h-3.4v10.8h3.5c1.3,0.1,2.6-0.4,3.4-1.4c0.9-1.2,1.3-2.7,1.2-4.2
		C64.5,48.6,64.4,47.8,64.1,47.1"
                />
                <path
                  class="st0"
                  d="M97.1,36.4h-0.8h-0.8c0-0.3,0-0.7,0.1-1c0-0.2,0.1-0.5,0.3-0.7c0.1-0.2,0.2-0.3,0.4-0.3
		c0.2-0.1,0.4-0.1,0.6-0.1c0.3,0,0.7,0.1,0.9,0.3c0.2,0.3,0.3,0.7,0.3,1.2v0.3c0,0.1,0,0.2,0,0.3H97.1 M99.3,39.1l-1,0.3
		c-0.3,0.1-0.5,0.1-0.7,0.2l-0.4,0.1h-0.3c-0.2,0-0.5,0-0.7-0.1c-0.2-0.1-0.4-0.2-0.5-0.3c-0.1-0.2-0.2-0.4-0.3-0.6
		c-0.1-0.3-0.1-0.7-0.1-1h1.3H98l1.6,0c0-0.2,0-0.5,0.1-0.8c0-0.2,0-0.4,0-0.6c0.1-0.9-0.2-1.7-0.8-2.3c-0.6-0.5-1.3-0.8-2.1-0.7
		c-0.9-0.1-1.8,0.3-2.4,1c-0.7,0.9-1,2.1-0.9,3.2c-0.1,1.1,0.2,2.1,0.8,3c0.7,0.7,1.6,1.1,2.6,1c0.3,0,0.7,0,1-0.1
		c0.4-0.1,0.9-0.2,1.6-0.4L99.3,39.1z M91.9,39.1c-0.2,0.1-0.4,0.2-0.6,0.3l-0.4,0.2c-0.1,0-0.2,0.1-0.3,0.1h-0.3
		c-0.2,0-0.5,0-0.7-0.1c-0.2-0.1-0.4-0.2-0.5-0.4c-0.1-0.2-0.2-0.5-0.3-0.8c-0.1-0.4-0.1-0.8-0.1-1.2c0-0.4,0-0.8,0.1-1.2
		c0-0.3,0.1-0.5,0.2-0.8c0.1-0.2,0.3-0.3,0.4-0.4c0.2-0.1,0.5-0.1,0.7-0.1c0.2,0,0.4,0,0.6,0c0.3,0.1,0.7,0.1,1,0.3l0.3-1.6
		c-0.4-0.1-0.8-0.2-1.3-0.2c-0.3,0-0.6,0-0.9,0c-0.9-0.1-1.8,0.3-2.3,1c-0.6,0.9-0.9,1.9-0.8,3c-0.1,1.1,0.2,2.2,0.8,3.1
		c0.6,0.7,1.5,1.1,2.4,1h0.4c0.2,0,0.3,0,0.4-0.1l0.6-0.2c0.2-0.1,0.5-0.1,0.8-0.2L91.9,39.1z M84.9,41.1V35
		c0.1-0.5-0.1-1.1-0.5-1.5c-0.4-0.3-0.9-0.4-1.4-0.4c-0.4,0-0.7,0.1-1.1,0.2c-0.5,0.1-1,0.4-1.5,0.7h-0.1v-0.7h-1.7v7.8h1.8v-5.9
		c0.3-0.2,0.7-0.3,1-0.4c0.3-0.1,0.7-0.1,1-0.1c0.2,0,0.4,0,0.6,0.2c0.1,0.2,0.2,0.3,0.2,0.5v5.7H84.9z M74.4,39.5
		c-0.5,0.2-1,0.3-1.5,0.4c-0.3,0-0.6,0-0.8-0.2c-0.2-0.2-0.2-0.5-0.2-0.7c0-0.2,0-0.3,0-0.5c0-0.2,0.1-0.3,0.2-0.4l2.2-0.2
		L74.4,39.5z M76.2,41.1V35c0.1-0.5-0.1-1.1-0.5-1.5c-0.5-0.3-1-0.4-1.6-0.4c-0.5,0-1,0-1.5,0.1c-0.7,0.1-1.3,0.3-1.9,0.5l0.3,1.5
		c0.3-0.1,0.5-0.2,0.8-0.2c0.3-0.1,0.5-0.1,0.8-0.2s0.5-0.1,0.7-0.1h0.5c0.2,0,0.3,0,0.5,0.1c0.1,0.1,0.2,0.3,0.2,0.4v1.4l-2,0.2
		c-0.3,0-0.6,0.1-0.9,0.2c-0.3,0.1-0.5,0.2-0.7,0.4c-0.2,0.2-0.4,0.4-0.5,0.7c-0.1,0.3-0.2,0.6-0.2,0.9c-0.1,0.6,0.1,1.2,0.5,1.6
		c0.4,0.4,1,0.5,1.5,0.5c0.1,0,0.2,0,0.4,0c0.1,0,0.3-0.1,0.4-0.1l0.6-0.2c0.2-0.1,0.5-0.2,0.8-0.3h0.1l0.1,0.5H76.2z M69.3,33.2
		c-0.2-0.1-0.4-0.1-0.6-0.1c-0.1,0-0.2,0-0.3,0c-0.1,0-0.2,0.1-0.4,0.1c-0.2,0.1-0.3,0.2-0.4,0.3c-0.2,0.1-0.4,0.3-0.6,0.5h-0.1
		v-0.8h-1.8v7.9h1.8v-5.7c0.1-0.1,0.3-0.2,0.5-0.3l0.4-0.2c0.1,0,0.2-0.1,0.3-0.1c0.1,0,0.2,0,0.3,0c0.1,0,0.2,0,0.3,0l0.4,0.1
		L69.3,33.2z M62.9,36.7v-1.8h-4v-3h4.2v-1.7h-6.2v10.9h2v-4.5L62.9,36.7z"
                />
                <path
                  class="st0"
                  d="M104.7,22.9h-0.8H103c0-0.3,0-0.7,0.1-1c0-0.2,0.1-0.5,0.3-0.6c0.1-0.2,0.2-0.3,0.4-0.3
		c0.2-0.1,0.4-0.1,0.6-0.1c0.3,0,0.7,0.1,0.9,0.4c0.2,0.3,0.3,0.7,0.3,1.1v0.2c0,0.1,0,0.2,0,0.3L104.7,22.9 M106.8,25.5l-1,0.3
		c-0.3,0.1-0.5,0.1-0.7,0.1l-0.4,0.1h-0.3c-0.2,0-0.5,0-0.7-0.1c-0.2,0-0.4-0.2-0.5-0.3c-0.1-0.2-0.2-0.4-0.3-0.6
		c-0.1-0.3-0.1-0.7-0.1-1h1.3c0.5,0,1,0,1.4,0h1.6c0-0.3,0-0.5,0.1-0.8c0-0.2,0-0.4,0-0.6c0.1-0.9-0.2-1.7-0.8-2.4
		c-0.6-0.5-1.4-0.8-2.2-0.8c-0.9-0.1-1.8,0.3-2.4,1c-0.7,0.9-1,2.1-0.9,3.2c-0.1,1.1,0.2,2.1,0.8,3c0.7,0.7,1.6,1.1,2.6,1
		c0.3,0,0.7,0,1-0.1c0.4-0.1,0.9-0.2,1.6-0.4L106.8,25.5z M99.5,25.5l-0.6,0.3c-0.1,0.1-0.3,0.1-0.4,0.1c-0.1,0-0.2,0.1-0.3,0.1
		h-0.3c-0.2,0-0.5,0-0.7-0.1c-0.2-0.1-0.4-0.2-0.5-0.4c-0.1-0.2-0.2-0.5-0.3-0.8c-0.1-0.4-0.1-0.8-0.1-1.2c0-0.4,0-0.8,0.1-1.2
		c0-0.3,0.1-0.5,0.2-0.8c0.1-0.2,0.3-0.3,0.4-0.4c0.2-0.1,0.5-0.1,0.7-0.1c0.2,0,0.4,0,0.6,0c0.3,0.1,0.7,0.1,1,0.3l0.3-1.6
		c-0.4-0.1-0.8-0.2-1.2-0.2c-0.3,0-0.6-0.1-0.9-0.1c-0.9,0-1.7,0.3-2.3,1c-0.6,0.9-0.9,2-0.8,3.1c-0.1,1.1,0.2,2.2,0.8,3.1
		c0.6,0.7,1.5,1.1,2.4,1h0.4c0.2,0,0.3,0,0.4-0.1l0.6-0.1c0.2-0.1,0.5-0.1,0.8-0.3L99.5,25.5z M92.5,27.5v-6.1
		c0.1-0.5-0.1-1.1-0.5-1.5c-0.4-0.3-0.9-0.5-1.3-0.4c-0.4,0-0.7,0.1-1.1,0.1c-0.5,0.2-1,0.4-1.5,0.6H88v-0.6h-1.8v7.9H88v-5.8
		c0.3-0.2,0.7-0.3,1-0.4c0.3-0.1,0.7-0.1,1-0.1c0.2,0,0.4,0,0.6,0.2c0.1,0.2,0.2,0.3,0.2,0.5v5.7L92.5,27.5z M82,25.9
		c-0.5,0.2-1,0.3-1.5,0.4c-0.3,0-0.6,0-0.8-0.2c-0.2-0.2-0.2-0.5-0.2-0.7c0-0.2,0-0.3,0-0.5c0-0.2,0.1-0.3,0.2-0.4l2.2-0.2L82,25.9z
		 M83.7,27.5v-6.1c0.1-0.5-0.1-1.1-0.5-1.5c-0.4-0.3-1-0.5-1.5-0.4c-0.5,0-1,0.1-1.5,0.1c-0.7,0.1-1.3,0.3-1.9,0.5l0.3,1.5
		c0.3-0.1,0.5-0.2,0.8-0.2c0.3-0.1,0.5-0.1,0.8-0.2l0.7-0.1c0.2,0,0.4,0,0.5,0c0.2,0,0.3,0,0.5,0.1c0.1,0.1,0.2,0.3,0.1,0.4v1.4
		l-2,0.2c-0.3,0-0.6,0.1-0.9,0.2c-0.3,0.1-0.5,0.2-0.7,0.4c-0.2,0.2-0.4,0.4-0.5,0.7c-0.1,0.3-0.2,0.6-0.2,0.9
		c-0.1,0.6,0.1,1.1,0.5,1.6c0.4,0.4,1,0.6,1.5,0.5h0.4c0.1,0,0.3-0.1,0.4-0.1l0.6-0.2L82,27h0.1l0.1,0.5L83.7,27.5z M75.7,16.6
		c-0.2-0.2-0.5-0.3-0.8-0.2c-0.3,0-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,0.8c0,0.3,0.1,0.6,0.3,0.8c0.5,0.4,1.1,0.3,1.6,0
		c0.2-0.2,0.3-0.5,0.3-0.8C76,17.1,75.9,16.8,75.7,16.6 M75.8,19.6H74v7.9h1.8L75.8,19.6z M71.5,27.5V16l-1.8,0.2v11.3H71.5z
		 M67.2,27.5V16l-1.8,0.2v11.3H67.2z M58.3,23.1l1-3.6c0-0.2,0.1-0.4,0.1-0.6c0-0.2,0.1-0.4,0.1-0.6h0.1c0,0.2,0,0.4,0.1,0.6
		c0.1,0.3,0.1,0.5,0.2,0.7l1,3.6H58.3z M64,27.6L61,16.7h-2.7l-3.1,10.8h2l0.8-2.9h3.3l0.8,2.9L64,27.6z"
                />
                <path
                  class="st0"
                  d="M79.1,0.6v1.6h-1v0.9h1v3.9c0,1.3,0.3,1.6,1.5,1.6h0.8V7.6h-0.5c-0.6,0-0.7-0.2-0.7-0.8V3.1h1.2V2.2h-1.2V0.6
		H79.1z M73.1,3.1v-1H72v6.4h1.1V5.1c0-1.3,0.6-2.1,1.7-2.1c1.2,0,1.4,0.9,1.4,1.8v3.6h1.1v-4c0-1.4-0.5-2.4-2.1-2.4
		C74.3,2,73.5,2.4,73.1,3.1 M65.9,4.8c0-1,0.8-1.8,1.9-1.8c1,0,1.8,0.8,1.8,1.8H65.9z M65.9,5.7h4.8c0.1-2-1-3.6-2.9-3.6
		c-1.7,0-3,1.3-3,3c0,0.1,0,0.2,0,0.3c-0.2,1.6,1,3.1,2.7,3.3c0.1,0,0.2,0,0.4,0c1.3,0.1,2.5-0.8,2.8-2h-1.1c-0.3,0.7-1,1.1-1.7,1
		C66.8,7.7,65.9,6.8,65.9,5.7C65.9,5.7,65.9,5.7,65.9,5.7 M55.8,8.5V5.1c0-1.3,0.6-2.1,1.5-2.1c1.2,0,1.3,0.9,1.3,1.8v3.6h1V5.1
		c0-1.3,0.6-2.1,1.5-2.1c1.2,0,1.3,0.9,1.3,1.8v3.6h1.1v-4c0-1.4-0.6-2.4-2.1-2.4c-0.9,0-1.7,0.4-2.1,1.1c-0.3-0.7-1-1.2-1.8-1.1
		c-0.8,0-1.5,0.3-1.9,1v-1h-1.1v6.4H55.8z M48.7,4.8c0-1,0.8-1.8,1.7-1.8c0,0,0.1,0,0.1,0c1,0,1.8,0.8,1.8,1.8c0,0,0,0,0,0H48.7z
		 M48.7,5.7h4.8c0.2-2-1-3.6-3-3.6c-1.7,0-3,1.3-3.1,2.9c0,0.1,0,0.2,0,0.3c-0.2,1.6,1,3.1,2.7,3.3c0.1,0,0.3,0,0.4,0
		c1.3,0.1,2.5-0.8,2.8-2h-1.1c-0.3,0.7-1,1.1-1.7,1C49.5,7.7,48.6,6.8,48.7,5.7 M42.2,3.1v-1h-1.1v6.4h1.1V5.1
		c0-1.3,0.6-2.1,1.7-2.1c1.2,0,1.4,0.9,1.4,1.8v3.6h1.1v-4c0-1.4-0.5-2.4-2.1-2.4C43.5,2.1,42.7,2.5,42.2,3.1 M35.1,4.8
		c0-1,0.8-1.8,1.7-1.8c0,0,0.1,0,0.1,0c1,0,1.8,0.8,1.8,1.8c0,0,0,0,0,0H35.1z M35.1,5.7h4.8c0.1-2-1-3.6-2.9-3.6
		c-1.7,0-3,1.3-3.1,2.9c0,0.1,0,0.2,0,0.3c-0.2,1.6,1,3.1,2.7,3.3c0.1,0,0.3,0,0.4,0c1.3,0.1,2.5-0.8,2.8-2h-1.1
		c-0.3,0.7-1,1.1-1.7,1C36,7.7,35.1,6.8,35.1,5.7C35.1,5.7,35.1,5.7,35.1,5.7 M37.4,1.3L38.9,0h-1.4l-1.1,1.4L37.4,1.3z M30.9,7
		l-1.7-4.8H28l2.4,6.3h1l2.3-6.3h-1.1L30.9,7z M22.8,4.8c0-1,0.8-1.8,1.8-1.8c0,0,0.1,0,0.1,0c1,0,1.8,0.8,1.8,1.8c0,0,0,0,0,0
		L22.8,4.8z M22.8,5.7h4.9c0.1-2-1-3.6-3-3.6c-1.7,0-3,1.3-3,3c0,0.1,0,0.2,0,0.3c-0.2,1.6,1,3.1,2.7,3.3c0.1,0,0.3,0,0.4,0
		c1.3,0.1,2.5-0.8,2.8-2h-1.1c-0.3,0.7-1,1.1-1.7,1C23.7,7.7,22.8,6.8,22.8,5.7C22.8,5.7,22.8,5.7,22.8,5.7 M25.1,1.3L26.6,0h-1.4
		l-1,1.4L25.1,1.3z M13.7,3.1v-1h-1.1v6.4h1.1V5.1c0-1.3,0.6-2.1,1.7-2.1c1.2,0,1.4,0.9,1.4,1.8v3.6h1.1v-4c0-1.4-0.6-2.4-2.1-2.4
		C14.9,2.1,14.1,2.4,13.7,3.1 M5.3,0H4.1v5.1c0,2.7,1,3.6,3.4,3.6s3.4-1.2,3.4-3.7V0H9.7v5.1c0,1.7-0.6,2.6-2.2,2.6S5.3,6.8,5.3,5.2
		V0z"
                />
              </g>
            </svg>
          </div>
        </div>

        <p>
          <small>
            <template v-if="$root.lang.current === 'fr'">
              Besoin d’aide, des questions ? Envoyez un email à
              <a
                href="mailto:r.diant@alliance-francaise-des-designers.org"
                target="_blank"
              >
                r.diant@alliance-francaise-des-designers.org
              </a>
            </template>
            <template v-else>
              Need help, questions? Send an email to
              <a
                href="mailto:r.diant@alliance-francaise-des-designers.org"
                target="_blank"
              >
                r.diant@alliance-francaise-des-designers.org
              </a>
            </template>
          </small>
          <br />
          <br />
          <template v-if="$root.lang.current === 'fr'">
            <small>
              Cette plate-forme a été créée et développée par
              <a href="https://latelier-des-chercheurs.fr/" target="_blank"
                >l’Atelier des chercheurs</a
              >
              avec et pour l’AFD. Elle se base sur le logiciel libre et
              open-source
              <a
                href="https://latelier-des-chercheurs.fr/outils/les-cahiers-du-studio"
                target="_bank"
              >
                Les Cahiers du Studio
              </a>
              et sa variante développée pour les
              <a href="https://dailleurs.delure.org/" target="_blank">
                Rencontres de Lure 2020 </a
              >.</small
            >
          </template>
          <template v-else>
            <small>
              This website/platform was created by
              <a href="https://latelier-des-chercheurs.fr/" target="_blank"
                >l’Atelier des chercheurs</a
              >
              with and for the organizers of Text and confused. It is based on
              the free software
              <a
                href="https://latelier-des-chercheurs.fr/en/tools/les-cahiers-du-studio"
                target="_bank"
                >The Studio's Notebooks/Les Cahiers du Studio</a
              >
              and its variant made for the
              <a href="https://dailleurs.delure.org/" target="_blank">
                Rencontres de Lure 2020</a
              >.
            </small>
          </template>

          <!-- <small>Crédits et technologies utilisées… </small> -->
        </p>
      </div>
    </div>

    <div class="m_informations--buttons" v-if="!$root.current_author">
      <button type="button" @click="$root.showAuthorsListModal = true">
        {{ $t("login").toLowerCase() }}
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      currentLang: this.$root.lang.current,
      show_detail: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    currentLang: function () {
      this.$root.updateLocalLang(this.currentLang);
    },
  },
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
.m_informations {
  position: relative;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;

  // color: white;

  font-size: 1em;
  height: 100%;

  // padding-top: calc(var(--spacing) / 2);
  // padding-bottom: calc(var(--spacing) / 2);

  display: flex;
  flex-flow: column nowrap;

  button,
  input,
  select {
    color: currentColor;
    border: none;
  }

  button {
    background: transparent;
  }

  h1,
  h2 {
    font-size: 1.25em;
    font-weight: bold;
    margin-bottom: 0;
  }
  ul {
    ul {
      margin-top: 0.5em;
    }
  }

  h2 {
    margin-left: var(--spacing);
  }

  h1 {
    img {
      max-width: 300px;
    }
  }

  h2 + p {
    margin-top: 0;
  }
}

.m_informations--presentation {
  overflow-y: auto;
  padding: var(--spacing);
  flex: 1 1 auto;

  background: linear-gradient(#44b4f7, 25%, #fff);
  background-attachment: scroll, local;
}

.m_informations--presentation--text {
  // text-align: center;
  margin-left: 1em;
}

h1 {
}

.m_informations--buttons {
  flex: 0 0 auto;

  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  background-color: #fff;

  padding: calc(var(--spacing) / 4);
  align-items: center;
  // border-top: 2px solid var(--color-rouge_vif);
  // background-color: #999;
  button {
    display: block;
    margin: calc(var(--spacing) / 2);
    color: currentColor;
    background-color: #f9f9f9;

    max-width: 23ch;
    padding: 5px 50px;
    min-height: 50px;
    border-radius: 25px;
    text-transform: uppercase;
    font-size: 1.5em;
  }
}

._logo {
  fill: white;
  max-width: 20ch;
  max-height: 14ch;
  margin: 0 auto;
}
._close_button {
  stroke: white;
  stroke-width: 2px;
  width: 44px;
  position: absolute;
  top: 0;
  right: 0;
}

ol {
  max-width: 350px;
  counter-reset: counter;
  list-style: none;
  padding-left: 0;
}
ol li {
  display: flex;
  align-items: center;
  margin: 0 0 1rem 0;
  counter-increment: counter;
  position: relative;
}
ol li::before {
  flex: 0 0 auto;
  content: "0" counter(counter);
  // color: #fcd000;
  font-size: 1rem;
  // font-weight: bold;
  // position: absolute;
  --size: 32px;
  // left: calc(-1 * var(--size) - 10px);
  // line-height: var(--size);
  width: var(--size);
  height: var(--size);
  // display: flex;
  align-items: center;
  // justify-content: center;
  line-height: 1.8;
  font-variant-numeric: tabular-nums;
  // top: 0;
  // transform: rotate(-10deg);
  background: var(--color-bleu_vif);
  border-radius: 50%;
  text-align: center;

  margin-right: 4px;
}

._unfold_button {
  background-color: var(--color-bleu_vif);
  font-size: 0.8em;
  padding: 0.3em;
}

._planning {
  margin-left: 0;
  padding-left: 0;
  list-style-type: none;

  ul {
    margin-left: 0;
    padding-left: 0;
    list-style-type: none;
  }

  li {
    margin-left: 0;
    padding-left: 0;

    ._spacer {
      padding-left: 3ch;
    }

    li {
      padding-left: 7.8ch;
    }
  }

  > li {
    // padding-left: 3ch;
  }
}

ol {
  margin-top: 3em;
}

blockquote {
  border-top: 2px solid var(--color-rouge_vif);
  font-weight: bold;
  font-size: 1.2em;
  margin-top: 1em;
  padding-top: 1em;
}

.t-indent {
  padding-left: var(--spacing);
}

h3 {
  font-family: "Compagnie II";
  color: white;
  margin: calc(var(--spacing) * 1) auto;
  font-size: 1.1em;
  letter-spacing: 0.04em;
  text-transform: lowercase;

  span {
    position: relative;
    z-index: 1;
    display: inline-block;
  }
  &:first-of-type {
    span {
      transform: rotate(-9deg);

      ._picto-bg {
        width: 130px;
        max-width: none;
        z-index: -1;
        height: 60px;
        margin: -23px -40px;
      }
    }
  }
  &:nth-of-type(2) {
    span {
      transform: rotate(5deg);
      margin-left: -8px;

      &::before {
        content: "";
        position: absolute;
        z-index: -1;
        width: 100%;
        height: 100%;
        padding: 0.6em 1em 0.8em;
        left: -1em;
        top: -0.9em;
        background-color: var(--color-rouge_vif);
      }
    }
  }
  &:nth-of-type(3) {
    span {
      margin-left: -12px;
      transform: rotate(-13.5deg);
      ._picto-bg {
        width: 140px;
        max-width: none;
        z-index: -1;
        height: 70px;
        margin: -24px -15px;
      }
    }
  }
  &:nth-of-type(4) {
    span {
      margin-left: 10px;
      transform: rotate(-13deg);
      ._picto-bg {
        width: 160px;
        max-width: none;
        z-index: -1;
        height: 70px;
        margin: -24px -32px;
      }
    }
  }
}

._picto-bg {
  position: absolute;
  top: 0;
  left: 0;
}

._signature {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
._picto_sociaux {
  display: flex;

  > * {
    margin-left: calc(var(--spacing) / 4);
  }
}
</style>
