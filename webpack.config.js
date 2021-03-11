const path = require('path');
const outPath = path.resolve(__dirname, 'public');

module.exports = {
    entry : './assets/js/root.js',
    output : {
        path : outPath,
        filename : 'enex.webpack.js',
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
                test : /\.(png|jpg|svg|jpeg|woff|ttf|eot)$/,
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