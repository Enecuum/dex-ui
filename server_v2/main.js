const path = require("path")
const fs = require("fs")

const express = require("express")
const app = express()
const bodyParser = express.json()

const webpack = require("webpack")
const webpackDevMiddleware = require("webpack-dev-middleware")
const webpackHotMiddleware = require("webpack-hot-middleware")
const w_config = require("../webpack.config")

const config = require("../config.json")

if (config.mode === "dev") {
    let hmr_plugin = new webpack.HotModuleReplacementPlugin()
    if (w_config.plugins && Array.isArray(w_config.plugins))
        w_config.plugins.push(hmr_plugin)
    else
        w_config.plugins = [ hmr_plugin ]
    let compiler = webpack(w_config)

    app.use(webpackDevMiddleware(
        compiler,
        {
            publicPath : w_config.output.path
        }
    ))
    app.use(webpackHotMiddleware(compiler))
}

app.use(express.static("../public"))

app.get('/enqlib', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html',
    });
    let data = fs.readFileSync(`../${config.web3_enq_path}`, { encoding: 'utf-8' });
    res.write(data);
    res.end();
});

app.get('/*\.(otf|ttf|png|svg|eot|woff)$', (req, res) => {
    let urlArr = req.url.split('/');
    res.writeHead(200, {
        'Content-Type': 'text/html',
    });
    try {
        let data = fs.readFileSync(path.join(w_config.output.path, urlArr[urlArr.length - 1]));
        res.write(data);
    } catch (e) {

    }
    res.end();
});

function filterLocale (locale) {
    if (locale === 'en-US' || locale === 'en')
        locale = 'en';
    else if (locale === 'ru-RU' || locale === 'ru')
        locale = 'ru';

    let files = fs.readdirSync(path.resolve('../public/locales'));
    if (files.indexOf(locale) === -1)
        return undefined;
    return locale;
}

app.get(`/locales/*/translation.json`, bodyParser, (req, res) => {
    let urlArr = req.url.split('/');
    let lang = urlArr[urlArr.length - 2];
    let language = filterLocale(lang);
    if (language) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
        });
        res.write(fs.readFileSync(path.join(w_config.output.path, '/locales/' + language + '/translation.json')));
    } else {
        res.writeHead(404, {
            'Content-Type': 'text/html',
        });
    }
    res.end();
});

app.listen(config.host_port)