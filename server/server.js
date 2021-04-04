const config = require('../config.json');
const wconf = require('../webpack.config');

const express = require('express');
const bodyParser = express.json();
const https = require('https');
const path = require('path');
const fs = require('fs');
const app = express();

const TransferPoint = require('./transferPoint');
const transferApi = new TransferPoint();

app.post(`/api/${config.api_version}/tx`, bodyParser, (req, res) => {
    transferApi.transferRequest(req.body)
    .then(result => {
        res.writeHead(200, {
            'Content-Type': 'application/json',
        });
        res.write(JSON.stringify(result));
    },
    error => {
        res.writeHead(500, {
            'Content-Type': 'application/json',
        });
        res.write(JSON.stringify(error));
    })
    .then(res.end());
});

app.get('/', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html',
    });
    let data = fs.readFileSync(path.join(wconf.output.path, 'index.html'));
    res.write(data);
    res.end();
});

app.get('/enex.webpack.js', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/js',
    });
    let data = fs.readFileSync(path.join(wconf.output.path, wconf.output.filename));
    res.write(data);
    res.end();
});

app.get('/getTokens', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    let data = fs.readFileSync(`../data/tokens.json`, { encoding : 'utf-8' });
    res.write(data);
    res.end();
});

app.get('/getPairs', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    let data = fs.readFileSync(`../data/pairs.json`, { encoding : 'utf-8' });
    res.write(data);
    res.end();
});

app.get('/getLanguage/*', (req, res) => {
    let urlArr = req.url.split('/');
    let language = urlArr[urlArr.length - 1];
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    let data = fs.readFileSync(`../data/${language}.json`, { encoding : 'utf-8' });
    res.write(data);
    res.end();
});

app.get('/enqlib', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html',
    });
    let urlArr = req.url.split('/');
    let data = fs.readFileSync(`../web-enq/prebuild/enqweb3.min.js`, { encoding : 'utf-8' });
    res.write(data);
    res.end();
});

https.createServer({
    key: fs.readFileSync('../https/key.pem', { encoding : 'utf8' }),
    cert: fs.readFileSync('../https/server.crt', { encoding : 'utf8' })
}, app)
.listen(config.host_port);