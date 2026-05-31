import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const groqKey =
    env.VITE_GROQ_API_KEY || env.VITE_GROK_API_KEY || env.grok_api_key || "";
  const xaiKey = env.VITE_XAI_API_KEY || "";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      proxy: {
        "/api/groq": {
          target: "https://api.groq.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/groq/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (groqKey) {
                proxyReq.setHeader("Authorization", `Bearer ${groqKey}`);
              }
            });
          },
        },
        "/api/xai": {
          target: "https://api.x.ai",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/xai/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (xaiKey) {
                proxyReq.setHeader("Authorization", `Bearer ${xaiKey}`);
              }
            });
          },
        },
      },
    },
  };
});
