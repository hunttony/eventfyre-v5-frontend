import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable the new JSX transform
      jsxRuntime: 'automatic',
      // Ensure React is automatically imported where needed
      jsxImportSource: 'react',
    })
  ],
  esbuild: {
    // This ensures React is automatically imported where needed
    jsxInject: `import React from 'react'`
  }
})
