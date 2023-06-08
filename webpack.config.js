const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ManifestPlugin = require("webpack-manifest-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function(env, argv) {
    const isProd = env.production;

    return {
        mode: isProd ? "production" : "development",

        devtool: isProd ? "none" : "source-map",

        entry: {
            app: path.resolve(__dirname, "./assets/script/app.ts"),
            sw: path.resolve(__dirname, "./assets/script/worker.ts"),
            home: path.resolve(__dirname, "./assets/script/home.ts"),
            late: path.resolve(__dirname, "./assets/script/late.ts")
        },

        output: {
            filename: (chunkData) => {
                return chunkData.chunk.name === "sw"
                ? "[name].js"
                : "[name].[chunkhash].bundle.js";
            },
            path: path.resolve(__dirname, "web"),
            publicPath: ""
        },

        plugins: [
            new CleanWebpackPlugin(["web"], {
                verbose: false,
                exclude: ["app.php", "index.php", ".htacess", "data.json", "en", "api", "version.json"],
            }),
            new GenerateJsonPlugin("version.json", {
                version: Math.floor(Date.now() / 1000),
            }),
            new CopyPlugin([
                {
                    from: path.resolve(__dirname, "./assets/images"),
                    to: path.resolve(__dirname, "./web/images")
                },
                // Copy workbox (generated from old mobile with mix)
                {
                    from: path.resolve(__dirname, "./assets/script/vendor/wbsw.js"),
                    to: path.resolve(__dirname, "./web/wbsw.js")
                }
            ]),
            new MiniCssExtractPlugin({
                filename: "[name].[chunkhash].css",
                chunkFilename: "[id].css",
            }),
            new ManifestPlugin()
        ],

        module: {
            rules: [
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        {
                            loader: "css-loader",
                            options: { sourceMap: true }

                        },
                        {
                            loader: "sass-loader",
                            options: { sourceMap: true }
                        }
                    ]
                },
                {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    use: "file-loader?name=/images/[name].[hash].[ext]"
                },
                {
                    test: /\.handlebars?$/,
                    loader: "handlebars-loader",
                    query: {
                        precompileOptions: {
                            knownHelpersOnly: false,
                        },
                        helperDirs: [
                            path.resolve(__dirname, "./assets/script/components/handlebars"),
                        ]
                    }
                },
                {
                    test: /\.tsx?$/,
                    use: "ts-loader",
                    exclude: /node_modules/
                },
                {
                    test: /\.ts$/,
                    enforce: "pre",
                    loader: "tslint-loader",
                    options: {
                        emitErrors: true,
                    },
                }
            ]
        },

        resolve: {
            symlinks: false,

            extensions: [ ".tsx", ".ts", ".js" ],

            alias: {
                // ts bindings
                "@app": path.resolve(__dirname, "./"),
                "@core": path.resolve(__dirname, "./core/core/"),
                "@plugins": path.resolve(__dirname, "./core/core/src/Plugins"),

                // legacy bindings
                "Base": path.resolve(__dirname, "./core/core/assets/js/components/"),
                "BaseVendor": path.resolve(__dirname, "./core/core/assets/js/vendor/"),
                "BaseTemplate": path.resolve(__dirname, "./core/core/templates/dafabet"),
            }
        },

        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        safari10: true,
                        mangle: false,
                    },
                }),
                new OptimizeCssAssetsPlugin()
            ],
        },
    }
};
