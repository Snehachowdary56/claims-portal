import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import webpack from "webpack";
import { fileURLToPath } from "node:url";
import { register } from "tsx/esm/api";

// The dev server runs the Express API, which is TypeScript: let Node load .ts files here.
register();

const here = dirname(fileURLToPath(import.meta.url));

export default async (env = {}, argv) => {
  const { createApp } = await import("./server/server.ts");
  const prod = argv.mode === "production";
  const demo = Boolean(env.demo);  // `npm run build:demo`: static build for GitHub Pages, no server
  const data = (f) => readFileSync(resolve(here, "server", "data", f), "utf8");
  return {
    entry: "./src/index.tsx",
    output: {
      path: resolve(here, demo ? "dist-demo" : "dist"),
      publicPath: "",
      filename: prod ? "js/[name].[contenthash:8].js" : "js/[name].js",
      chunkFilename: prod ? "js/[name].[contenthash:8].js" : "js/[name].js",
      clean: true,
    },
    resolve: { extensions: [".ts", ".tsx", ".js", ".jsx"] },
    module: {
      rules: [
        { test: /\.[jt]sx?$/, exclude: /node_modules/, use: "babel-loader" },
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
      new webpack.DefinePlugin({
        __DEMO__: JSON.stringify(demo),
        __DEMO_POLICIES_XML__: demo ? JSON.stringify(data("policies.xml")) : "null",
        __DEMO_CLAIMS__: demo ? data("claims.json") : "null",
      }),
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
