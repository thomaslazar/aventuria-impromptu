import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import LootView from "./LootView.vue";
import { i18n } from "../i18n";

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/loot", component: LootView }],
  });

describe("LootView", () => {
  afterEach(() => {
    i18n.global.locale.value = "de";
  });

  it("renders the loot view with default NPC tab active", async () => {
    const router = createTestRouter();
    router.push("/loot");
    await router.isReady();

    const wrapper = mount(LootView, {
      global: {
        plugins: [i18n, router],
      },
    });

    expect(wrapper.text()).toContain("Beute");
    expect(wrapper.text()).toContain("Spontane Taschenkontrollen oder Raubzüge");

    const tabs = wrapper.findAll("button[role='tab']");
    expect(tabs).toHaveLength(2);

    const npcTab = tabs.at(0);
    const treasureTab = tabs.at(1);

    expect(npcTab?.attributes("aria-selected")).toBe("true");
    expect(treasureTab?.attributes("aria-selected")).toBe("false");
    expect(npcTab?.classes()).toContain("loot-tabs__button--active");
    expect(treasureTab?.classes()).not.toContain("loot-tabs__button--active");
  });

  it("switches tabs when clicked", async () => {
    const router = createTestRouter();
    router.push("/loot");
    await router.isReady();

    const wrapper = mount(LootView, {
      global: {
        plugins: [i18n, router],
      },
    });

    const tabs = wrapper.findAll("button[role='tab']");
    const npcTab = tabs.at(0);
    const treasureTab = tabs.at(1);

    // Initially NPC tab should be active
    expect(npcTab?.attributes("aria-selected")).toBe("true");
    expect(treasureTab?.attributes("aria-selected")).toBe("false");
    expect(wrapper.text()).toContain("Spontane Taschenkontrollen oder Raubzüge");

    // Click treasure tab
    await treasureTab?.trigger("click");

    // Now treasure tab should be active
    expect(npcTab?.attributes("aria-selected")).toBe("false");
    expect(treasureTab?.attributes("aria-selected")).toBe("true");
    expect(npcTab?.classes()).not.toContain("loot-tabs__button--active");
    expect(treasureTab?.classes()).toContain("loot-tabs__button--active");
    expect(wrapper.text()).toContain("Für verlassene Tempel, geheime Lagerhäuser");
  });

  it("renders correct tab labels in German", async () => {
    i18n.global.locale.value = "de";
    const router = createTestRouter();
    router.push("/loot");
    await router.isReady();

    const wrapper = mount(LootView, {
      global: {
        plugins: [i18n, router],
      },
    });

    const tabs = wrapper.findAll("button[role='tab']");
    expect(tabs.at(0)?.text()).toBe("NSC");
    expect(tabs.at(1)?.text()).toBe("Schatz");
  });

  it("renders correct tab labels in English", async () => {
    i18n.global.locale.value = "en";
    const router = createTestRouter();
    router.push("/loot");
    await router.isReady();

    const wrapper = mount(LootView, {
      global: {
        plugins: [i18n, router],
      },
    });

    const tabs = wrapper.findAll("button[role='tab']");
    expect(tabs.at(0)?.text()).toBe("NPC");
    expect(tabs.at(1)?.text()).toBe("Treasure");
  });

  it("has proper ARIA attributes for accessibility", async () => {
    const router = createTestRouter();
    router.push("/loot");
    await router.isReady();

    const wrapper = mount(LootView, {
      global: {
        plugins: [i18n, router],
      },
    });

    const tablist = wrapper.find("nav[role='tablist']");
    expect(tablist.exists()).toBe(true);

    const tabs = wrapper.findAll("button[role='tab']");
    tabs.forEach((tab) => {
      expect(tab.attributes("aria-selected")).toBeDefined();
    });
  });
});
