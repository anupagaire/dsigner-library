import resolve  from '@rollup/plugin-node-resolve';
import babel    from '@rollup/plugin-babel';
import postcss  from 'rollup-plugin-postcss';

export default {
  input: 'src/index.js',
  output: {
    file:   'dist/index.js',
    format: 'es',
  },
  external: ['react', 'react-pdf'],
  plugins: [
    resolve(),
    postcss(),   // ← handles CSS imports
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env', '@babel/preset-react'],
      extensions: ['.js', '.jsx'],
    }),
  ],
};