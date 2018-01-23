const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const paths = {
  DIST: path.resolve(__dirname, "dist"),
  SRC: path.resolve(__dirname, "src"),
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
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "WeightTracker: The App",
      template: path.join(paths.SRC, "index.html"),
    }),
  ],
};

module.exports = config;
