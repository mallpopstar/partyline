import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'partyline',
      fileName: 'partyline',
      formats: ['es', 'iife', 'umd'],
    },
    minify: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
})