const config = require('./config.json');
const express = require('express');
const https = require('https');
// const bodyParser = express.json();
const fs = require('fs');
const app = express();

app.get('/', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html',
    });
    let data = fs.readFileSync(`./client/index.html`);
    res.write(data);
    res.end();
});

app.get('/css/*', (req, res) => {
    let urlArr = req.url.split('/');
    res.writeHead(200, {
        'Content-Type': 'text/css',
    });
    let data = fs.readFileSync(`./client/css/${urlArr[urlArr.length - 1]}`);
    res.write(data);
    res.end();
});

app.get('/js/*', (req, res) => {
    let urlArr = req.url.split('/');
    res.writeHead(200, {
        'Content-Type': 'text/html',
    });
    let fileName = urlArr[urlArr.length - 1];
    if (config.obfuscated.status) {
        fileName = fileName.substring(0, fileName.length - 3) + config.obfuscated.postfix;
    }
    let data = fs.readFileSync(`./client/js/${fileName}`);
    res.write(data);
    res.end();
});

app.get('/img/*', (req, res) => {
    let urlArr = req.url.split('/');
    res.writeHead(200, {
        'Content-Type': 'image/png',
    });
    let data = fs.readFileSync(`./client/img/${urlArr[urlArr.length - 1]}`);
    res.write(data);
    res.end();
});

app.get('/getTokens', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    let data = fs.readFileSync(`./data/tokens.json`, { encoding : 'utf-8' });
    res.write(data);
    res.end();
});

app.get('/getPairs', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    let data = fs.readFileSync(`./data/pairs.json`, { encoding : 'utf-8' });
    res.write(data);
    res.end();
});

https.createServer({
    key: fs.readFileSync('./https/key.pem', { encoding : 'utf8' }),
    cert: fs.readFileSync('./https/server.crt', { encoding : 'utf8' })
}, app)
.listen(1234);