import { config } from 'dotenv';
import { resolve } from 'path';
import * as core from '@rspack/core';

config();

const devMode = (process.env as any).NODE_ENV === 'development';
const isProduction = !devMode;
const outputPath = resolve(process.cwd(), isProduction ? '../../docs' : 'dist');
const SERVER = process.env.SERVER || 'localhost';
const publicPath = isProduction ? 'https://erikvullings.github.io/crime_scripts/' : '';
const APP_TITLE = 'Crime Scripting';
const APP_DESC = 'GUI for creating and editing crime scripts';
const APP_PORT = 3498;

console.log(
  `Running in ${
    isProduction ? 'production' : 'development'
  } mode, serving from http://${SERVER}:${APP_PORT} and public path ${publicPath}, output directed to ${outputPath}.`
);

const configuration: core.Configuration = {
  experiments: {
    css: true,
  },
  mode: isProduction ? 'production' : 'development',
  entry: {
    main: './src/app.ts',
  },
  devServer: {
    port: APP_PORT,
  },
  devtool: devMode ? 'inline-source-map' : 'source-map',
  plugins: [
    new core.DefinePlugin({
      'process.env.SERVER': isProduction ? `'${publicPath}'` : "'http://localhost:4545'",
    }),
    new core.HtmlRspackPlugin({
      title: APP_TITLE,
      publicPath,
      scriptLoading: 'defer',
      minify: !devMode,
      favicon: './src/favicon.ico',
      meta: {
        viewport: 'width=device-width, initial-scale=1',
        'Content-Security-Policy': {
          'http-equiv': 'Permissions-Policy',
          content: 'interest-cohort=(), user-id=()',
        },
        'og:title': APP_TITLE,
        'og:description': APP_DESC,
        'og:url': SERVER || '',
        'og:site_name': APP_TITLE,
        'og:image:alt': APP_TITLE,
        'og:image': './src/assets/logo.svg',
        'og:image:type': 'image/svg',
        'og:image:width': '200',
        'og:image:height': '200',
      },
    }),
    new core.HotModuleReplacementPlugin(),
    new core.LightningCssMinimizerRspackPlugin(),
    new core.SwcJsMinimizerRspackPlugin({
      minimizerOptions: devMode
        ? {}
        : {
            compress: true,
            minify: true,
            // mangle: true,
          },
    }),
  ],
  resolve: {
    extensions: ['...', '.ts', '*.wasm', '*.csv', '*.json'], // "..." means to extend from the default extensions
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          sourceMap: true,
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /^BUILD_ID$/,
        type: 'asset/source',
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                modifyVars: {
                  // Options
                },
                javascriptEnabled: true,
              },
            },
          },
        ],
        type: 'css', // This is must, which tells rspack this is type of css resources
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [],
  },
  output: {
    filename: '[id].bundle.js',
    path: outputPath,
  },
};

export default configuration;
