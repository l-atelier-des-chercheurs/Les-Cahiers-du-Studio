import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import CahierView from "@/views/CahierView.vue";

// adc-core answers every unknown URL with index.pug (api2.js loadIndex),
// whose <base href="/"> keeps the assets loading from any depth
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    // the cahier at "cahiers/<slug>"
    {
      path: "/cahiers/:slug",
      name: "cahier",
      component: CahierView,
      props: true,
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});
