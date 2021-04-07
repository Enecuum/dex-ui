const path = require('path');
const fs = require('fs');
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
                use : ['style-loader', 'css-loader']
            },
            {
                test : /\.(png|jpg|svg|jpeg|woff|ttf|eot|otf)$/,
                use : 'file-loader'
            }
        ]
    },
    mode : 'development',
    devServer : {
        contentBase : outPath,
        port : 1235,
        watchContentBase : true,
        before: (app) => {
            app.get('/getLanguage/*', (req, res) => {
                let urlArr = req.url.split('/');
                let language = urlArr[urlArr.length - 1];
                res.json(JSON.parse(fs.readFileSync(`./data/${language}.json`, { encoding : 'utf-8' })));
            });
            app.get('/pools', (req, res) => {
                res.json(JSON.parse(fs.readFileSync(`./data/pairs.json`, { encoding : 'utf-8' })));
            });
            app.get('/tokens', (req, res) => {
                res.json(JSON.parse(fs.readFileSync(`./data/tokens.json`, { encoding : 'utf-8' })));
            });
            app.get('/enqlib', (req, res) => {
                res.send(fs.readFileSync(`./web-enq/prebuild/enqweb3.min.js`, { encoding : 'utf-8' }));
            });
        }
    }
};