const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const CamundaModelerWebpackPlugin = require('camunda-modeler-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './client/client.js',
  output: {
    path: path.resolve(__dirname, 'client'),
    filename: 'client.bundle.js'
  },
  plugins: [
    new CamundaModelerWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: 'node_modules/bpmn-js-token-simulation/assets',
          to: 'assets/bpmn-js-token-simulation'
        }
      ],
    })
  ],
  devtool: 'cheap-module-source-map'
};