import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { nextTick } from "vue";
import App from "@/App.vue";
import { SUPPORTED_LOCALES } from "@/i18n/localizedText";
import { i18n } from "@/i18n";

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/about", component: { template: "<div />" } },
      { path: "/tavern", component: { template: "<div />" } },
      { path: "/npcloot", component: { template: "<div />" } },
      { path: "/treasureloot", component: { template: "<div />" } },
    ],
  });

describe("App", () => {
  afterEach(() => {
    i18n.global.locale.value = "de";
  });

  it("renders translated navigation and switches locale via the selector", async () => {
    const router = createTestRouter();
    router.push("/");
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [i18n, router],
      },
    });

    const navigation = wrapper.get("nav.codex-nav");
    expect(navigation.attributes("aria-label")).toBe("Hauptnavigation");

    const localeSelect = wrapper.get("select#codex-language-select");
    const selectElement = localeSelect.element as HTMLSelectElement;

    expect(localeSelect.findAll("option")).toHaveLength(
      SUPPORTED_LOCALES.length,
    );

    await localeSelect.setValue("en");
    await nextTick();

    expect(navigation.attributes("aria-label")).toBe("Primary navigation");
    expect(selectElement.value).toBe("en");
  });
});
