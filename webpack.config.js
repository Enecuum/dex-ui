const path   = require('path')
const WriteFilePlugin = require('write-file-webpack-plugin')

const outPath = path.resolve(__dirname, 'public');

module.exports = {
    entry : {
        main : [
            path.resolve(__dirname, 'assets/js/root.js'),
        ]
    },
    output : {
        path : outPath,
        filename : 'enex.webpack.js',
    },
    module : {
        rules : [
            {
                test : /\.jsx?$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env',
                              '@babel/react',{
                              'plugins': ['@babel/plugin-proposal-class-properties']}]
                }
            },
            {
                test : /\.css$/,
                use : ['style-loader', 'css-loader']
            },
            {
                test : /\.(png|jpg|ico|svg|jpeg|woff|ttf|eot|otf)$/,
                use : 'file-loader'
            }
        ]
    },
    performance: {
        maxEntrypointSize: 4 * 1024 * 1024,
        maxAssetSize: 4 * 1024 * 1024
    },
    plugins : [
    ],
    mode : 'production',
    devServer : {
        contentBase : outPath
    }
};
