import vscode from "@tomjs/vite-plugin-vscode";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths() , react(), vscode()],
  resolve: {
    // The workspace packages import React from source. Ensure the webview
    // uses the same React instance for hooks across all workspace packages.
    dedupe: ['react', 'react-dom'],
  },
});
