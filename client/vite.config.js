import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': '/src',
      'assets': "/src/assets",
      'styles': '/src/styles',
      'components': '/src/components',
      'contexts': '/src/contexts',
      'utils': '/src/utils',
      "types": "/src/types"
    }
  },
  plugins: [react()],
  build: {
    outDir: "../server/gateway/client"
  }
});
