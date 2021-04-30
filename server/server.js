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

    getBalanceBody (id) {
        return {
            data : {
                type : 'user_balance',
                params : {
                    id : id
                }
            }
        };
    };

    getltData (balances, pools) {
        let filtered = [];
        for (let pool of pools)
            if (balances[pool.lt] !== undefined)
                filtered.push(pool);
        return { data : filtered };
    };

    getTokens (result, error) {
        transferApi.straightRequest('tokens')
        .then(
            result,
            error
        );
    };

    getPools (result, error) {
        transferApi.straightRequest('pools')
        .then(
            result,
            error
        );
    };

    getBalances (id , result, error) {
        transferApi.transferRequest(this.getBalanceBody(id))
        .then(
            result,
            error
        );
    };

    convertBalances (result) {
        return new Promise((resolve) => {
            let balances = [];
            this.getTokens(
                tokens => {
                    for (let prop in result ) {
                        balances.push({
                            amount : result[prop],
                            token : prop,
                            ticker : tokens.find(el => el.hash == prop).ticker,
                            decimals : 10,
                            minable : 0,
                            reissuable : 0
                        });
                    }
                    resolve(balances);
                },
                error => resolve(balances)
            );
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

        this.app.get(`/locales/*/translation.json`, bodyParser, (req, res) => {
            let urlArr = req.url.split('/');
            res.writeHead(200, {
                'Content-Type': 'text/html',
            });
            let data = fs.readFileSync(path.join(wconf.output.path, urlArr[urlArr.length - 2]));
            res.write(data);
            res.end();
        });

        this.app.get(`/api/${config.api_version}/get_tickers_all`, (req, res) => {
            this.getTokens(
                result => this.wrapJSONResponse(res, 200, result),
                error => this.wrapJSONResponse(res, 500, error)
            );
        });

        this.app.get(`/api/${config.api_version}/get_dex_pools`, (req, res) => {
            this.getPools(
                result => this.wrapJSONResponse(res, 200, result),
                error => this.wrapJSONResponse(res, 500, error)
            );
        });

        this.app.get(`/api/${config.api_version}/balance_all`, (req, res) => {
            this.getBalances(req.query.id,
                async result => {
                    this.wrapJSONResponse(res, 200, await this.convertBalances(result.result))
                },
                error => {
                    this.wrapJSONResponse(res, 500, error)
                }
            );
        });

        this.app.get(`/api/${config.api_version}/balance`, (req, res) => {
            transferApi.transferRequest(this.getBalanceBody(req.query.id))
            .then(
                response => {
                    let balance = response.result[req.query.token];
                    if (balance !== undefined) {
                        this.wrapJSONResponse(res, 200, { amount : balance });
                    } else 
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

        // this.app.get('/getTokens', (req, res) => {                      // DEPRECATED
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

        // this.app.get(`/lt_data`, (req, res) => {                          // DEPRECATED
        //     transferApi.transferRequest(this.getBalanceBody(req.query.id))
        //     .then(
        //         balances => {
        //             if (balances.result !== undefined) {
        //                 transferApi.straightRequest('pools')
        //                 .then(
        //                     pools => {
        //                         this.wrapJSONResponse(res, 200, this.getltData(balances.result, pools));
        //                     },
        //                     error => this.wrapJSONResponse(res, 500, error)
        //                 );
        //             } else {
        //                 this.wrapJSONResponse(res, 200, { data : []})
        //             }
        //         },
        //         error => this.wrapJSONResponse(res, 500, error)
        //     );
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
            let data = fs.readFileSync(`../${config.web3_enq_path}`, { encoding: 'utf-8' });
            res.write(data);
            res.end();
        });
    };

    run () {
        // https.createServer({
        //     key: fs.readFileSync('../https/key.pem', { encoding: 'utf8' }),
        //     cert: fs.readFileSync('../https/server.crt', { encoding: 'utf8' })
        // }, this.app)
        this.app.listen(config.host_port);
    };
};

let server = new TestServer();
if (argv.run)
    server.run();

module.exports = server;