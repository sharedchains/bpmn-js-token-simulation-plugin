import { string } from 'rollup-plugin-string';

export default {
  input: 'resources/index.js',
  output: {
    file: 'client/icons/index.js',
    format: 'esm'
  },
  plugins: [
    string({
      include: '**/*.svg'
    })
  ]
};