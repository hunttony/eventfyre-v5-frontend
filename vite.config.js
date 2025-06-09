import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime
      jsxRuntime: 'automatic',
      // Use the new JSX transform
      jsxImportSource: 'react',
      // Enable fast refresh
      
      fastRefresh: true,
      // Ensure React is only imported once
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', {
            runtime: 'automatic',
            importSource: 'react'
          }]
        ]
      }
    })
  ],
  resolve: {
    alias: {
      // Ensure consistent React imports
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react/jsx-runtime': path.resolve('./node_modules/react/jsx-runtime.js')
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@emotion/react',
      '@emotion/styled'
    ],
    esbuildOptions: {
      // Ensure React is only included once
      loader: {
        '.js': 'jsx'
      }
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      // Ensure React is externalized and not bundled multiple times
      external: ['react', 'react-dom', 'react/jsx-runtime']
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  }
})
