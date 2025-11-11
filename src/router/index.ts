import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue";
import TavernView from "@/views/TavernView.vue";
import LootView from "@/views/LootView.vue";
const OptolithConverterView = () => import("@/views/OptolithConverterView.vue");

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      component: AboutView,
    },
    {
      path: "/tavern",
      name: "tavern",
      component: TavernView,
    },
    {
      path: "/loot",
      name: "loot",
      component: LootView,
    },
    {
      path: "/tools/optolith-converter",
      name: "optolith-converter",
      component: OptolithConverterView,
    },
  ],
});

export default router;
