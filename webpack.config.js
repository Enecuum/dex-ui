const path = require('path')
const execSync = require('child_process').execSync
const webpack = require('webpack')
const config = require(path.join(__dirname, 'config.json'))

module.exports = () => {

    const MODE      = process.env.NODE_ENV || 'development'
    const PUBLIC    = path.resolve(__dirname, 'public')
    const SOURCE    = path.resolve(__dirname, 'assets/js')
    const VERSION   = execSync('git rev-parse --short HEAD').toString().trim()
    let plugins = []
    plugins.push(new webpack.DefinePlugin({
        VERSION : JSON.stringify(VERSION),
        MODE : JSON.stringify(MODE),
        "process.env.NODE_DEBUG": JSON.stringify(process.env.NODE_DEBUG),
        // "Math.pow": "((a,b) => {return a**b})" do not work
    }))

    return {
        entry : {
            app : [path.resolve(SOURCE, 'root.js')],
            routingWorker : path.resolve(SOURCE, 'utils/routingWorker.js'),
            trustedTokensAnalyzer : path.resolve(SOURCE, 'utils/trustedTokensAnalyzer.js')
        },
        output : {
            path : PUBLIC,
            filename : 'js/enex.[name].js',
            chunkFilename: 'js/enex.[name].js',
            hotUpdateChunkFilename: 'hot/[runtime].hot-update.js',
            hotUpdateMainFilename: 'hot/[runtime].hot-update.json'
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
                    test : /\.(png|jpg|ico|svg|jpeg|woff|ttf|eot|otf|webp)$/,
                    use : 'file-loader'
                }
            ]
        },
        plugins,
        devtool: 'inline-source-map',
        mode : MODE,
        devServer : {
            contentBase : PUBLIC
        }
    }
}
