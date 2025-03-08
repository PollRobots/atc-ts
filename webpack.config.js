const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  const distPath = path.join(__dirname, "/dist");

  return {
    entry: "./src/index.tsx",
    output: {
      clean: true,
      path: distPath,
      filename: "atc-ts.[name].[contenthash].js",
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

    devtool: "source-map",
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
      ],
    },

    ignoreWarnings: [/Failed to parse source map/],

    plugins: [
      new HtmlWebpackPlugin({
        title: "ATC",
        filename: "atc-ts.html",
        template: "index.template.html",
      }),
    ],

    optimization: {
      splitChunks: {
        chunks: "all",
      },
      minimize: isProduction,
    },
  };
};
