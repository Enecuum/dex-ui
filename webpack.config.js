const path = require('path')

const outPath = path.resolve(__dirname, 'public');

module.exports = {
    entry : {
        app : [
            path.resolve(__dirname, 'assets/js/root.js'),
        ]
    },
    output : {
        path : outPath,
        filename : 'enex.webpack.js',
        hotUpdateChunkFilename: 'hot/hot-update.js',
        hotUpdateMainFilename: 'hot/hot-update.json'
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
    devtool: 'inline-source-map',
    mode : 'production',
    // mode : 'development',
    devServer : {
        contentBase : outPath
    }
};
