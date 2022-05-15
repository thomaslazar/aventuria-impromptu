import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue";
import NpcLootView from "@/views/NpcLootView.vue";
import TreasureLootView from "@/views/TreasureLootView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
      path: "/npcloot",
      name: "npcloot",
      component: NpcLootView,
    },
    {
      path: "/treasureloot",
      name: "treasureloot",
      component: TreasureLootView,
    },
  ],
});

export default router;
