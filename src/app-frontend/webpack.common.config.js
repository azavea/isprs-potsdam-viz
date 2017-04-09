const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './js/Main.jsx',
    },
    output: {
        path: __dirname,
        filename: 'pgw.communitymapping.[hash].js',
    },
    eslint: {
        configFile: '.eslintrc',
    },
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass'],
            },
            {
                test: /\.jsx?/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
            },
            {
                test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
                loader: 'url-loader',
            },
            {
                test: /\.(jpg|png|gif)$/,
                loader: 'url?limit=25000',
            },
            {
                test: /\.(html)$/,
                loader: 'html-loader?name=[name].[ext]',
            },
        ],
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        modulesDirectories: [
            'node_modules',
            'common',
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'GeoTrellis Point Cloud Demo',
            filename: 'index.html',
            template: 'template.html',
        }),
    ],
};
