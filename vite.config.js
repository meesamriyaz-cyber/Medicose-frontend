import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const useHttps = env.VITE_USE_HTTPS === "true";
  const isDev = mode === "development";

return {
     plugins: [react(), tailwindcss()],

     base: "./",

     build: {
       outDir: "dist",
     },

    server: {
      host: true,
      port: 5173,

      /**
       * ✅ HTTPS ONLY FOR LOCAL BROWSER TESTING
       * ❌ SHOULD NEVER BE IN PRODUCTION OR MOBILE BUILDS
       */
      https: useHttps
        ? {
            key: fs.readFileSync(path.resolve(__dirname, "localhost-key.pem")),
            cert: fs.readFileSync(path.resolve(__dirname, "localhost.pem")),
          }
        : false,

      /**
       * ✅ Proxy ONLY used in development browser
       * ❌ NOT USED by Android / Capacitor / Phone
       */
      ...(isDev && {
        proxy: {
          "/api": {
            target: env.VITE_API_URL || "http://localhost:5000",
            changeOrigin: true,
            secure: false,
          },
        },
      }),
    },
  };
});
