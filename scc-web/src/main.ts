import { createApp } from "vue";
import { createPinia } from "pinia";
import "./shared/styles.css";
import App from "./App.vue";
import router from "./router";
import { useAppearanceStore } from "./shared/appearance";

const pinia = createPinia();
useAppearanceStore(pinia);
createApp(App).use(pinia).use(router).mount("#app");
