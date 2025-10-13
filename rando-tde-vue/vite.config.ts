import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
) as { version?: string };

const gitSha =
  process.env.GITHUB_SHA?.slice(0, 7) ?? resolveGitCommitHash() ?? "unknown";

const buildInfo = {
  version: packageJson.version ?? "0.0.0",
  gitSha,
  builtAt: new Date().toISOString(),
};

function resolveGitCommitHash(): string | null {
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "/rando-tde/",
  test: {
    environment: "jsdom",
  },
  define: {
    __APP_BUILD_INFO__: JSON.stringify(buildInfo),
  },
});
