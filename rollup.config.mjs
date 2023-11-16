import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'
import progress from 'rollup-plugin-progress';
import postcss from 'rollup-plugin-postcss'
import autoprefixer from "autoprefixer"

const
    dev = (process.env.NODE_ENV !== 'production'),
    sourcemap = dev

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
            replace({
                preventAssignment: true,
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