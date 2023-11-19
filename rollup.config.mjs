import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'
import strip from '@rollup/plugin-strip';
import progress from 'rollup-plugin-progress'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from "autoprefixer"
import pkg from './package.json' assert { type: 'json' };


const production = !process.env.ROLLUP_WATCH
const sourcemap = !production

const banner = `
/*!
 * ENEI Editor for ENEI CMS
 * Copyright 2023 Serhii Pimenov
 * Licensed under MIT
 !*/
`

export default [
    {
        input: './src/index.js',
        watch: {
            include: 'src/**',
            clearScreen: false
        },
        plugins: [
            progress({
                clearLine: true,
            }),
            strip({
                functions: production ? ['console.log'] : []
            }),
            replace({
                preventAssignment: true,
                __version__: pkg.version
            }),
            postcss({
                extract: false,
                minimize: true,
                use: ['less'],
                sourceMap: sourcemap,
                plugins: [
                    autoprefixer(),
                ]
            }),
            nodeResolve({
                browser: true
            }),
            commonjs(),
        ],
        output: [
            {
                file: './lib/enei-editor.js',
                format: 'iife',
                sourcemap,
                banner,
                name: "EneiEditor",
                plugins: [
                    terser()
                ]
            },
            {
                file: './dist/enei-editor.esm.js',
                format: 'es',
                sourcemap,
                banner,
                plugins: [
                    terser()
                ]
            },
            {
                file: './dist/enei-editor.cjs.js',
                format: 'cjs',
                sourcemap,
                banner,
                plugins: [
                    terser()
                ]
            },
        ]
    }
];