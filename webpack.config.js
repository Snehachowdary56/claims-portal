import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./server/server.js";

const here = dirname(fileURLToPath(import.meta.url));

export default (_env, argv) => {
  const prod = argv.mode === "production";
  return {
    entry: "./src/index.js",
    output: {
      path: resolve(here, "dist"),
      filename: prod ? "js/[name].[contenthash:8].js" : "js/[name].js",
      chunkFilename: prod ? "js/[name].[contenthash:8].js" : "js/[name].js",
      clean: true,
    },
    resolve: { extensions: [".js", ".jsx"] },
    module: {
      rules: [
        { test: /\.jsx?$/, exclude: /node_modules/, use: "babel-loader" },
        { test: /\.css$/, use: [prod ? MiniCssExtractPlugin.loader : "style-loader", "css-loader"] },
        {
          test: /\.scss$/,
          use: [
            prod ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
            // Bootstrap 5.3 still uses Sass @import; silence its deprecation notices, not ours
            { loader: "sass-loader", options: { sassOptions: { quietDeps: true, silenceDeprecations: ["import", "global-builtin", "color-functions"] } } },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: "./src/index.html" }),
      ...(prod ? [new MiniCssExtractPlugin({ filename: "css/[name].[contenthash:8].css" })] : []),
    ],
    optimization: {
      splitChunks: { cacheGroups: { vendor: { test: /node_modules/, name: "vendor", chunks: "all" } } },
      minimizer: ["...", new CssMinimizerPlugin({ minimizerOptions: { preset: ["default", { svgo: false }] } })],
    },
    // Performance budget: the build fails if the first load gets too big.
    performance: prod ? { hints: "error", maxEntrypointSize: 400_000, maxAssetSize: 300_000 } : false,
    devtool: prod ? "source-map" : "eval-cheap-module-source-map",
    devServer: {
      port: 8080,
      open: false,
      // run the Express API inside the dev server, so `npm start` is the whole app
      setupMiddlewares: (middlewares, devServer) => {
        devServer.app.use(createApp());
        return middlewares;
      },
    },
  };
};
