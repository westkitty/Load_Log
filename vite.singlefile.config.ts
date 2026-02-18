import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    build: {
        outDir: 'dist-single',
        emptyOutDir: true,
        assetsInlineLimit: 100000000, // Force inline all assets
        rollupOptions: {
            output: {
                // Ensure no external assets are generated
                inlineDynamicImports: true,
            }
        }
    },
    // @ts-expect-error - vite-plugin-singlefile types might not match exactly but this is valid
    plugins: [
        react(),
        viteSingleFile({ useRecommendedBuildConfig: false, removeViteModuleLoader: true })
    ],
});
