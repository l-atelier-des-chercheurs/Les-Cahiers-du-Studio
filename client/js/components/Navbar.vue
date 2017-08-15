<template>
  <div class="navbar">
    <nav class="navbar_top" v-if="$root.settings.currentlyOpenedFolder !== ''">
      <div class="wrapper">
        <div class="container">
          <div class="menu_icon">
            <svg class="svg-icon" viewBox="0 0 20 20">
            		<path fill="none" d="M3.314,4.8h13.372c0.41,0,0.743-0.333,0.743-0.743c0-0.41-0.333-0.743-0.743-0.743H3.314
       c-0.41,0-0.743,0.333-0.743,0.743C2.571,4.467,2.904,4.8,3.314,4.8z M16.686,15.2H3.314c-0.41,0-0.743,0.333-0.743,0.743 s0.333,0.743,0.743,0.743h13.372c0.41,0,0.743-0.333,0.743-0.743S17.096,15.2,16.686,15.2z M16.686,9.257H3.314
       c-0.41,0-0.743,0.333-0.743,0.743s0.333,0.743,0.743,0.743h13.372c0.41,0,0.743-0.333,0.743-0.743S17.096,9.257,16.686,9.257z"></path>
        			</svg>
          </div>

          <ol class="breadcrumb">
            <li>
              <a href="" @click.prevent="$root.closeFolder()">
                studio-théâtre.<i>vitry</i>
              </a>
            </li>
            <li v-if="typeof folder !== 'undefined'">
              <template>{{ folder.name }}</template>
            </li>
          </ol>
        </div>
      </div>
    </nav>
    <div v-else class="navbar_left">
      <header class="m_logo">
        <a href="home">
          <p>
            studio-<br>
            théâtre<br>
            <i>.vitry</i>
          </p>
        </a>
      </header>
      <nav class="m_navigation" role="navigation">
        <ul class="submenu">
          <li class="menu-item">
            <a href="//localhost:3000/pw/2017-studiotheatre.fr">Accueil</a>
          </li>
          <li class="menu-item">
            <a href="//localhost:3000/pw/2017-studiotheatre.fr/calendrier">Calendrier</a>
          </li>
          <li class="menu-item">
            <a href="//localhost:3000/pw/2017-studiotheatre.fr/le-studio-theatre">Le studio-th&eacute;&acirc;tre</a>
          </li>
          <li class="menu-item">
            <a href="//localhost:3000/pw/2017-studiotheatre.fr/en-creation">En cr&eacute;ation</a>
          </li>
          <li class="menu-item">
            <a href="//localhost:3000/pw/2017-studiotheatre.fr/en-recherche">En recherche</a>
          </li>
          <li class="menu-item">
            <a href="//localhost:3000/pw/2017-studiotheatre.fr/ateliers">Ateliers</a>
          </li>
          <li class="menu-item">
            <a href="//localhost:3000/pw/2017-studiotheatre.fr/en-pratique">En Pratique</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</div>
</template>
<script>

export default {
  props: ['folder']
}
</script>
<style scoped lang="less">


</style>