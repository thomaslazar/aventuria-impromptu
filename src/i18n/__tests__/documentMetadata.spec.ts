import { afterEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { i18n } from "@/i18n";
import { bindDocumentMetadata } from "@/i18n/documentMetadata";

const resetDocument = () => {
  document.documentElement.setAttribute("lang", "en");
  document.title = "";
};

describe("bindDocumentMetadata", () => {
  afterEach(() => {
    i18n.global.locale.value = "de";
    resetDocument();
  });

  it("synchronizes document language and title with the active locale", async () => {
    const unbind = bindDocumentMetadata(i18n);

    expect(document.documentElement.getAttribute("lang")).toBe("de");
    expect(document.title).toBe(
      "Aventuria Impromptu – Aventurische Zufallstabellen",
    );

    i18n.global.locale.value = "en";
    await nextTick();

    expect(document.documentElement.getAttribute("lang")).toBe("en");
    expect(document.title).toBe(
      "Aventuria Impromptu – Aventurian Random Tables",
    );

    unbind();
  });
});
