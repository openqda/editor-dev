/// <reference types="vitest" />
import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    plugins: [
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
    build: {
        sourcemap: true,
    },
    server: {
        watch: {
            ignored: [
                '.idea',
                '.deploy',
                'app/**',
                'vendor/**',
                'bootstrap/**',
                'config/**',
                'data/**',
                'database/**',
                'docker/**',
                'routes/**',
                'storage/**',
                'stories/**'
            ]
        }
    },
    test: {
        include: ['src/js/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
        exclude: [
            '**/node_modules/**',
            'public/',
            '**/dist/**',
            '**/cypress/**',
            '**/.{idea,git,cache,output,temp}/**',
            'stories',
            '.storybook',
            'app/',
            'bootstrap/',
            'config/',
            'database/',
            'routes/',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'],
        // enable jest-like global test APIs
        globals: true,
        // simulate DOM with happy-dom
        environment: 'happy-dom',
        coverage: {
            enabled: true,
            subdir: true,
            include: ['src/js/**/*'],
            provider: 'v8',
            reporter: ['text', 'html']
        },
    }
});
