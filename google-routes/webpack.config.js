const webpack = require('webpack');
const path = require('path');
const dotenv = require('dotenv').config({
  path: path.join(__dirname, '.env'),
});
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const modeConfig = (env) => require(`./build-utils/webpack.${env}`)(env);
const presetConfig = require('./build-utils/loadPresets');

const config = async (
  { mode, presets } = { mode: 'production', presets: [] }
) => {
  // Plugin to process HTML
  const htmlPlugin = new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.join(__dirname, './src/index.html'),
  });

  return merge(
    {
      mode,

      resolve: {
        fallback: {
          path: false,
        },
      },

      context: path.join(__dirname, './src'),

      entry: {
        // main JS file
        app: './js/main.js',
      },

      target: 'node', // support native modules

      // different loaders are responsible for different file types
      module: {
        rules: [
          {
            test: /\.(png|jpg|gif|eot|ttf|woff|woff2|svg)$/,
            type: 'asset/resource',
          },
          {
            test: /\.pug$/,
            loader: 'pug-loader',
          },
          {
            test: /\.(js)$/,
            exclude: /(node_modules)/,
            loader: 'babel-loader',
          },
          {
            test: /\.(json|geojson)$/i,
            exclude: /(node_modules)/,
            loader: 'json-loader',
          },
        ],
      },

      target: 'web', // important! index.js does not work without it

      plugins: [
        htmlPlugin,
        new webpack.ProgressPlugin(),
        new webpack.DefinePlugin({
          'process.env.GOOGLE_API_KEY': JSON.stringify(
            process.env.GOOGLE_API_KEY
          ),
        }),
      ],

      resolve: {
        extensions: ['.js', '*'],
        modules: [path.join(__dirname, 'node_modules')],
      },
    },

    modeConfig(mode),

    presetConfig({ mode, presets })
  );
};

module.exports = config;
