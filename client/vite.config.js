import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// AstraOS frontend build/dev configuration
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
