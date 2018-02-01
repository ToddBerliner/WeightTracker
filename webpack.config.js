const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const paths = {
  DIST: path.resolve(__dirname, "dist"),
  SRC: path.resolve(__dirname, "src"),
  ART: path.resolve(__dirname, "art"),
};

// Webpack config
const config = {
  entry: path.join(paths.SRC, "app.js"),
  output: {
    path: paths.DIST,
    filename: "app.bundle.js",
  },
  devServer: {
    contentBase: paths.SRC,
    host: "0.0.0.0",
    port: 8080,
  },
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader"],
        }),
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: { chunks: "all" },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "WT",
      template: path.join(paths.SRC, "index.html"),
    }),
    new FaviconsWebpackPlugin({
      logo: path.join(paths.ART, "wticon_square.png"),
      icons: {
        android: false,
        appleIcon: true,
        appleStartup: true,
        coast: false,
        favicons: true,
        firefox: false,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: false,
      },
    }),
    new ExtractTextPlugin({
      filename: "[name].css",
    }),
  ],
};

module.exports = config;
