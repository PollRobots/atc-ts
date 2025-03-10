const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  const distPath = path.join(__dirname, "/dist");
  const srcPath = path.join(__dirname, "/src");

  return {
    entry: "./src/index.tsx",
    output: {
      clean: true,
      path: distPath,
      filename: "atc.[name].[contenthash].js",
    },

    devServer: {
      port: 8080,
      host: "0.0.0.0",
      static: {
        publicPath: distPath,
      },
      client: {
        overlay: {
          runtimeErrors: false,
        },
      },
      historyApiFallback: true,
    },

    devtool: isProduction ? undefined : "source-map",
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },

    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: "ts-loader",
        },
        {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader",
        },
        {
          test: /\.css$/i,
          include: srcPath,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
            "postcss-loader",
          ],
        },
        {
          test: /\/games\/.*$/,
          type: "asset/source",
        },
      ],
    },

    ignoreWarnings: [/Failed to parse source map/],

    plugins: [
      new HtmlWebpackPlugin({
        title: "ATC",
        filename: "atc.html",
        template: "index.template.html",
      }),
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: "atc.[contenthash].css",
            }),
          ]
        : []),
    ],

    optimization: {
      splitChunks: {
        chunks: "all",
      },
      minimize: isProduction,
    },
  };
};
