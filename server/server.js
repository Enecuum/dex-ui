const config = require('../config.json');
const wconf = require('../webpack.config');
const argv = require('yargs').argv;
const express = require('express');
const bodyParser = express.json();
const https = require('https');
const path = require('path');
const fs = require('fs');

const TransferPoint = require('./transferPoint');
const transferApi = new TransferPoint(argv);

class TestServer {
    wrapJSONResponse(res, code, result) {
        res.writeHead(code, {
            'Content-Type': 'application/json',
        });
        try {
            res.write(JSON.stringify(result));
        } catch (err) {
            // console.log(err);
        }
        res.end();
    };

    handleArgs (argv) {
        if (argv.mode == 'create_token') {
            if (!argv.t) {
                console.log('write ticker');
            }
            let emission = (argv.e) ? argv.e : 0;
            let pubkey = (argv.p) ? argv.p : '029dd222eeddd5c3340e8d46ae0a22e2c8e301bfee4903bcf8c899766c8ceb3a7d';
            transferApi.createToken(argv.t, emission, pubkey)
        }
    };  

    convertPools (pools) {
        return pools.map(element => {
            return {
                token_0 : {
                    hash : element.t1,
                    volume : element.v1
                },
                token_1 : {
                    hash :  element.t2,
                    volume : element.v2
                },
                pool_fee : 0,
                lt : element.lt
            };
        });
    };

    constructor() {
        this.app = express();
        this.handleArgs(argv);
        // -------------------------------------------------- transfer point

        this.app.post(`/api/${config.api_version}/tx`, bodyParser, (req, res) => {
            transferApi.transferRequest(req.body)
            .then(
                result => this.wrapJSONResponse(res, 200, result),
                error => this.wrapJSONResponse(res, 500, error)
            );
        });

        this.app.get(`/tokens`, (req, res) => {
            let urlArr = req.url.split('/');
            let type = urlArr[urlArr.length - 1];
            transferApi.straightRequest(type)
            .then(
                result => this.wrapJSONResponse(res, 200, result),
                error => this.wrapJSONResponse(res, 500, error)
            );
        });

        this.app.get(`/pools`, (req, res) => {
            let urlArr = req.url.split('/');
            let type = urlArr[urlArr.length - 1];
            transferApi.straightRequest(type)
            .then(
                result => {
                    let pools = this.convertPools(result);
                    this.wrapJSONResponse(res, 200, pools)
                },
                error => this.wrapJSONResponse(res, 500, error)
            );
        });

        this.app.get(`/api/${config.api_version}/balance`, (req, res) => {
            let body = {
                data : {
                    type : 'user_balance',
                    params : {
                        id : req.query.id
                    }
                }
            };
            transferApi.transferRequest(body)
            .then(
                responce => {
                    let balance = responce.result[req.query.token];
                    if (balance !== undefined)
                        this.wrapJSONResponse(res, 200, { amount : balance });
                    else 
                        this.wrapJSONResponse(res, 200, { amount : 0 });
                },
                error => this.wrapJSONResponse(res, 500, error)
            );
        });

        this.app.post('/faucet', bodyParser, (req, res) => {
            transferApi.faucet(req.body.id, req.body.hash, req.body.amount)
            .finally(result => this.wrapJSONResponse(res, 200, result));
        });

        this.app.post('/create_token', bodyParser, (req, res) => {
            transferApi.createToken(req.body.ticker, req.body.emission, req.body.pubkey)
            .finally(result => this.wrapJSONResponse(res, 200, result));
        });

        // -------------------------------------------------- index.html and other cite components

        this.app.get('/', (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/html',
            });
            let data = fs.readFileSync(path.join(wconf.output.path, 'index.html'));
            res.write(data);
            res.end();
        });

        this.app.get('/*\.(otf|ttf|png|svg|eot|woff)$', (req, res) => {
            let urlArr = req.url.split('/');
            res.writeHead(200, {
                'Content-Type': 'text/html',
            });
            let data = fs.readFileSync(path.join(wconf.output.path, urlArr[urlArr.length - 1]));
            res.write(data);
            res.end();
        });

        this.app.get('/enex.webpack.js', (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/js',
            });
            let data = fs.readFileSync(path.join(wconf.output.path, wconf.output.filename));
            res.write(data);
            res.end();
        });

        // -------------------------------------------------- first time server API

        // this.app.get('/getTokens', (req, res) => {
        //     res.writeHead(200, {
        //         'Content-Type': 'application/json',
        //     });
        //     let data = fs.readFileSync(`../data/tokens.json`, { encoding : 'utf-8' });
        //     res.write(data);
        //     res.end();
        // });

        // this.app.get('/getPairs', (req, res) => {
        //     res.writeHead(200, {
        //         'Content-Type': 'application/json',
        //     });
        //     let data = fs.readFileSync(`../data/pairs.json`, { encoding : 'utf-8' });
        //     res.write(data);
        //     res.end();
        // });

        this.app.get('/getLanguage/*', (req, res) => {
            let urlArr = req.url.split('/');
            let language = urlArr[urlArr.length - 1];
            res.writeHead(200, {
                'Content-Type': 'application/json',
            });
            let data = fs.readFileSync(`../data/${language}.json`, { encoding: 'utf-8' });
            res.write(data);
            res.end();
        });

        // -------------------------------------------------- enq-web library

        this.app.get('/enqlib', (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/html',
            });
            let urlArr = req.url.split('/');
            let data = fs.readFileSync(`../web-enq/prebuild/enqweb3.min.js`, { encoding: 'utf-8' });
            res.write(data);
            res.end();
        });
    };

    run () {
        https.createServer({
            key: fs.readFileSync('../https/key.pem', { encoding: 'utf8' }),
            cert: fs.readFileSync('../https/server.crt', { encoding: 'utf8' })
        }, this.app)
        .listen(config.host_port);
    };
};

let server = new TestServer();
server.run();