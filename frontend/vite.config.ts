import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react({
    // Optimize for production builds - remove problematic options
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production
    minify: mode === 'production' ? 'esbuild' : false,
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks: {
          // Split vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      },
      // Handle external dependencies
      external: [],
    },
    chunkSizeWarningLimit: 2000,
    // Increase memory for build process
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  // Environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  }
}));
