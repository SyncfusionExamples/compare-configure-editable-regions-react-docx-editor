import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Relative base so the build can be hosted in any Azure sub-folder.
    // For SPA routing on Azure Static Web Apps / App Service, deep links
    // like /document-protection are handled by their built-in fallback.
    base: '/compare-configure-editable-regions-react-docx-editor',
    server: {
        port: 5173
    }
})