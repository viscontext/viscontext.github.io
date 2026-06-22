import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://viscontext.github.io",
  output: "static",
  outDir: "../../dist",
  publicDir: "../../generated/public",
  trailingSlash: "always",
});
