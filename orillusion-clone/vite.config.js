// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";
import dns from "dns";
dns.setDefaultResultOrder("verbatim");

module.exports = defineConfig({
  server: {
    host: "localhost",
    port: 7500,
  },
  publicDir: "public",
  resolve: {
    alias: {
      "@orillusion/core": resolve(__dirname, "./src/index.ts"),
      "@orillusion": resolve(__dirname, "./packages"),
      //"dat.gui": resolve(__dirname, "./packages/debug/dat.gui.module"),
    },
    mainFields: ["module:dev", "module"],
  },
});
