import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["cjs"],
  dts: false,
  clean: false,
  sourcemap: false,
  platform: "node",
  target: "node18",
  outExtension: () => ({
    js: ".cjs",
  }),
});
