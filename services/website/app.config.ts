import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
    vite: {
        resolve: {
            alias: {
                "@": resolve(dirname(fileURLToPath(import.meta.url)), "src")
            }
        }
    },
    server: {
        preset: "cloudflare-pages"
    },
    ssr: false
});
