import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import CahierView from "@/views/CahierView.vue";

// adc-core answers every unknown URL with index.pug (api2.js loadIndex),
// whose <base href="/"> keeps the assets loading from any depth.
//
// A cahier is at the root, /<slug>, as in v2: its URL is short enough to be
// announced (https://…/rencontres). Why that doesn't clash: see slugs.js.
// The app's own pages, if any, must start with "_" (/_admin).

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    // the cahier at "cahiers/<slug>"
    {
      path: "/:slug",
      name: "cahier",
      component: CahierView,
      props: true,
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

// /authors/ when the slug is also a content folder: the server redirected
router.beforeEach((to) => {
  if (to.path.length > 1 && to.path.endsWith("/"))
    return { ...to, path: to.path.replace(/\/+$/, "") };
});
