import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    dts: {
      tsgo: true,
    },
    exports: true,
    entry: {
      index: "src/index.ts",
      cli: "src/cli.ts",
    },
  },
  lint: { options: { typeAware: true, typeCheck: true } },
});
