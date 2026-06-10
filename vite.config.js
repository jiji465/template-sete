import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                // pdf.js é o maior peso do bundle e só é usado na importação de PGDAS-D
                manualChunks: {
                    pdfjs: ['pdfjs-dist'],
                },
            },
        },
    },
})
