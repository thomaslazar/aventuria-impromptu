import "bootstrap/dist/css/bootstrap.min.css";
import "@/assets/codex.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { i18n } from "./i18n";
import { bindDocumentMetadata } from "./i18n/documentMetadata";

const app = createApp(App);

app.use(router);
app.use(i18n);
bindDocumentMetadata(i18n);

app.mount("#app");

import "bootstrap/dist/js/bootstrap.js";
