import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

const demoBase = `/${(process.env.DEMO_BASE_PATH ?? "").split("/").filter(Boolean).join("/")}`.replace(/^\/$/, "");
const portal = process.env.DEMO_APP === "psi" ? "psi" : "scc";

export default defineConfig({
  base: `${demoBase}/${portal}/`,
  build: { outDir: portal === "psi" ? "dist-psi" : "dist" },
  plugins: [vue(), Components({ resolvers: [ElementPlusResolver({ importStyle: "css" })] })],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { port: 3201, strictPort: true }
});
