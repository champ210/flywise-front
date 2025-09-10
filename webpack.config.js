import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import dotenv from 'dotenv';

// Replicate __dirname functionality in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local file
const env = dotenv.config({ path: './.env.local' }).parsed || {};


// Create an object for DefinePlugin to expose environment variables
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

export default {
  mode: 'development', // Use 'production' for build script
  entry: './index.tsx', // Your app's entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      // Replicating the alias from your vite.config.ts
      '@': path.resolve(__dirname, '.'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // Use your existing index.html as a template
    }),
    // This plugin makes environment variables available to your code
    new webpack.DefinePlugin(envKeys),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    historyApiFallback: true, // Important for single-page apps with routing
  },
};
