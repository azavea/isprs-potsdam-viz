const webpack = require('webpack');
const config = require('./webpack.common.config');

const port = 8284;
const serverport = 9100;

config.output.path = '../';

// Transpiling needs to happen first
config.module.loaders.unshift(
    {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query:
        {
            presets: ['es2015', 'react'],
            plugins: ['transform-runtime'],
            env: {
                development: {
                    presets: ['react-hmre'],
                }
            }
        }
    }
);

config.devServer =  {
  contentBase: './dist',
  info: true,
  hot: true,
  inline: true,
  progress: true,
  'history-api-fallback': true,
  port: port,
  proxy: {
    '*': { target: 'http://nginx' }
  }
};

config.plugins.push(
    new webpack.SourceMapDevToolPlugin({
        filename: '[file].map'
    })//,
    // new webpack.DefinePlugin({
    //     'process.env': {
    //         NODE_ENV: JSON.stringify('development'),
    //         MAPZEN_API_KEY: config.apiKeysConfig.MAPZEN_API_KEY,
    //         CIVIC_INFO_API_KEY: config.apiKeysConfig.CIVIC_INFO_API_KEY,
    //         CENSUS_API_KEY: config.apiKeysConfig.CENSUS_API_KEY,
    //     },
    // })
);

config.watchOptions = {
    poll: 1000
};

module.exports = config;
