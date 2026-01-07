import { defineConfig } from 'vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  // plugins: [
  //   nodePolyfills({
  //     // Whether to polyfill specific globals.
  //     globals: {
  //       Buffer: true,
  //       global: true,
  //       process: true,
  //     },
  //     // Whether to polyfill `node:` protocol imports.
  //     protocolImports: true,
  //   }),
  // ],
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
})
