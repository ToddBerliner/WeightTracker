const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

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
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "WeightTracker: The App",
      template: path.join(paths.SRC, "index.html"),
    }),
    new FaviconsWebpackPlugin({
      logo: path.join(paths.ART, "wticon.png"),
      icons: {
        android: false,
        appleIcon: false,
        appleStartup: false,
        coast: false,
        favicons: true,
        firefox: false,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: false,
      },
    }),
  ],
};

module.exports = config;
