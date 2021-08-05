const path   = require('path');
const server = require('./server/server');
const config = require('./config.json');
const fs     = require('fs');

const outPath = path.resolve(__dirname, 'public');

module.exports = {
    entry : path.resolve(__dirname, 'assets/js/root.js'),
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
    mode : 'development',
    devServer : {
        contentBase : outPath,
        port : 1234,
        watchContentBase : true,
        before: (app) => {
            app.get('/getLanguage/*', (req, res) => {
                let urlArr = req.url.split('/');
                let language = urlArr[urlArr.length - 1];
                res.json(JSON.parse(fs.readFileSync(`./data/${language}.json`, { encoding : 'utf-8' })));
            });
            app.get('/enqlib', (req, res) => {
                res.send(fs.readFileSync(config.web3_enq_path, { encoding : 'utf-8' }));
            });
            app.get(`/api/${config.api_version}/get_dex_pools`, (req, res) => {
                server.getPools(
                    result => res.json(result),
                    error => res.json([])
                );
            });
            app.get(`/api/${config.api_version}/get_tickers_all`, (req, res) => {
                server.getTokens(
                    result => res.json(result),
                    error => res.json([])
                );
            });
            app.get(`/api/${config.api_version}/balance_all`, (req, res) => {
                server.getBalances( req.query.id,
                    async result => res.json(await server.convertBalances(result.result)),
                    error => res.json([])
                );
            });
            app.get('/favicon', (req, res) => {
                let data = fs.readFileSync(path.resolve('./public/favicon.ico'));
                res.send(data);
            });
            app.get('/swap', (req, res) => {
                let data = fs.readFileSync(path.resolve('./public/index.html'));
                res.write(data);
                res.end();
            });
        }
    }
};