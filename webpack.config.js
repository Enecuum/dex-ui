const path = require('path');
const outPath = path.resolve(__dirname, 'public');

module.exports = {
    entry : './client/js/root-tmp.js',
    output : {
        path : outPath,
        filename : 'test.webpack.js',
    },
    module : {
        rules : [
            {
                test : /\.jsx?$/,
                use : 'babel-loader'
            },
            {
                test : /\.css$/,
                use : 'css-loader'
            },
            {
                test : /\.(png|jpg)$/,
                use : 'file-loader'
            }
        ]
    },
    // plugins : [
    //     new HtmlWebpackPlugin()
    // ]
    mode : 'development',
    devServer : {
        contentBase : outPath,
        port : 1235,
        watchContentBase : true
    }
};