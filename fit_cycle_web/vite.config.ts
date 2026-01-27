import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { resolve } from "path";
import { viteMockServe } from "vite-plugin-mock";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    viteMockServe({
      mockPath: "mock",
      enable: true,
      logger: true,
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/types": resolve(__dirname, "./types"),
      "@/utils": resolve(__dirname, "./utils"),
      "@/config": resolve(__dirname, "./config"),
      "@/store": resolve(__dirname, "./store"),
      "@/services": resolve(__dirname, "./services"),
      "@/components": resolve(__dirname, "./components"),
      "@/styles": resolve(__dirname, "./styles"),
      "@/mocks": resolve(__dirname, "./mocks"),
    },
  },
  css: {
  postcss: "./postcss.config.cjs";
}
});
