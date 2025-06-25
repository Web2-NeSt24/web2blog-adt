 import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
   plugins: [reactRouter(), tsconfigPaths()],
   server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
   ssr: {
    noExternal: ['@uiw/react-textarea-code-editor']
  },
   optimizeDeps: {
    include: ['@uiw/react-textarea-code-editor']
  }
});
