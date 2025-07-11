 import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
   plugins: [reactRouter(), tsconfigPaths()],
   server: {
     proxy: {
       '/api': {
         target: 'http://127.0.0.1:8000',
         changeOrigin: true,
         secure: false,
       },
     },
   },
   optimizeDeps: {
     include: ['react', 'react-dom', 'react-bootstrap'],
   },
});
