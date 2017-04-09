const webpack = require('webpack');
const config = require('./webpack.common.config');

config.output.path = '/usr/src/dist/';

// Transpiling needs to happen first
config.module.loaders.unshift(
    {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        plugins: ['transform-runtime'],
        query:
        {
            presets: ['es2015', 'react'],
        },
    }
);

// config.plugins.push(
//     new webpack.DefinePlugin({
//         'process.env': {
//             NODE_ENV: JSON.stringify('production'),
//             MAPZEN_API_KEY: config.apiKeysConfig.MAPZEN_API_KEY,
//             CIVIC_INFO_API_KEY: config.apiKeysConfig.CIVIC_INFO_API_KEY,
//             CENSUS_API_KEY: config.apiKeysConfig.CENSUS_API_KEY,
//         },
//     }),
//     new webpack.optimize.UglifyJsPlugin({
//         compress: {
//             warnings: false,
//         },
//     })
// );

module.exports = config;
