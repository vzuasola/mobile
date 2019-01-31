const mix = require('webpack-mix').mix;
const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');

mix.webpackConfig({
    plugins: [
        new CleanWebpackPlugin(['web'], {
            verbose: false,
            exclude: ['app.php', 'index.php', '.htacess', 'data.json', 'en', 'api', 'manifest.json', 'version.json'],
        }),
        new GenerateJsonPlugin('version.json', {
            version: Math.floor(Date.now() / 1000),
        }),
    ],

    module: {
        rules: [
            {
                test: /\.handlebars?$/,
                loader: 'handlebars-loader',
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
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                options: {
                    emitErrors: true,
                },
            }
        ]
    },

    resolve: {
        symlinks: false,

        alias: {
            // ts bindings
            "@app": path.resolve(__dirname, './'),
            "@core": path.resolve(__dirname, './core/core/'),
            "@plugins": path.resolve(__dirname, './core/core/src/Plugins'),

            // legacy bindings
            "Base": path.resolve(__dirname, './core/core/assets/js/components/'),
            "BaseVendor": path.resolve(__dirname, './core/core/assets/js/vendor/'),
            "BaseTemplate": path.resolve(__dirname, "./core/core/templates/dafabet"),
        }
    },
});

if (!mix.inProduction()) {
    mix.webpackConfig({
        devtool: 'source-map',
    }).sourceMaps();
}

mix
    .setPublicPath('web')
    .copy('assets/images', 'web/images')
    .ts('assets/script/app.ts', 'web/app.js')
    .ts('assets/script/worker.ts', 'web/sw.js')
    .babel('node_modules/workbox-sw/build/workbox-sw.js', 'web/wbsw.js')
    .sass('assets/sass/app.scss', 'web/')
    .version()
;
