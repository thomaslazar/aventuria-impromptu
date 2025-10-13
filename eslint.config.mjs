import vueTs from "@vue/eslint-config-typescript";
import vuePrettier from "@vue/eslint-config-prettier";

export default [
  {
    ignores: ["dist/**", "coverage/**"],
  },
  ...vueTs(),
  vuePrettier,
];
