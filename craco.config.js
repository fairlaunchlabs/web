const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // 完全禁用 node_modules 的 source map
            // webpackConfig.module.rules = webpackConfig.module.rules.filter(rule => {
            //     if (rule.enforce === 'pre' && rule.use && Array.isArray(rule.use)) {
            //         return !rule.use.some(loader => 
            //             loader.loader && loader.loader.includes('source-map-loader')
            //         );
            //     }
            //     return true;
            // });

            // 配置 fallbacks
            webpackConfig.resolve.fallback = {
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                assert: require.resolve('assert'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                os: require.resolve('os-browserify'),
                url: require.resolve('url'),
                zlib: require.resolve('browserify-zlib'),
                buffer: require.resolve('buffer'),
                process: require.resolve('process/browser.js'),
            };

            // 禁用 source maps
            webpackConfig.devtool = false;

            return webpackConfig;
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser.js',
                Buffer: ['buffer', 'Buffer'],
            }),
        ],
    },
};
