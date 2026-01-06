import { defineConfig } from "vite";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  optimizeDeps: {
    exclude: ['snarkjs'], // Importante!
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
        react(),
        wasm(),
        topLevelAwait()
      ],
    },
  },
});
