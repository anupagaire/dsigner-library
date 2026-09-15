import resolve  from '@rollup/plugin-node-resolve';
import babel    from '@rollup/plugin-babel';
import postcss  from 'rollup-plugin-postcss';
import commonjs from '@rollup/plugin-commonjs';
import terser   from '@rollup/plugin-terser';
import replace  from '@rollup/plugin-replace';

export default [
  // ── 1. npm build (react external) ──
  {
    input: 'src/index.js',
    output: {
      file:   'dist/index.js',
      format: 'es',
    },
    external: ['react', 'react-pdf'],
    plugins: [
      resolve(),
      postcss(),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env', '@babel/preset-react'],
        extensions: ['.js', '.jsx'],
      }),
    ],
  },


  {
    input: 'src/standalone.js',
    output: {
      file:   'dist/dsigner-widget.umd.js',
      format: 'umd',
      name:   'DsignerWidgets',
    },
    external: [],
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      resolve(),
      commonjs(),
      postcss(),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env', '@babel/preset-react'],
        extensions: ['.js', '.jsx'],
      }),
      terser(),
    ],
  },
];