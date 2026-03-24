import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function adminShortcutPlugin() {
  return {
    name: "admin-shortcut-link",
    configureServer(server) {
      server.httpServer?.once("listening", () => {
        const address = server.httpServer?.address();
        if (!address || typeof address === "string") return;

        const port = address.port;
        const host = String(server.config.server.host || "localhost");
        const normalizedHost = host === "0.0.0.0" || host === "::" ? "localhost" : host;

        // Print extra quick links so team members can open Home/Admin without typing.
        console.log(`  Home:  http://${normalizedHost}:${port}/`);
        console.log(`  Admin: http://${normalizedHost}:${port}/admin`);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), adminShortcutPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
