# Dex

#### Preparing for usage

* install necessary dependencies
```
    npm install
```
* update web-enq submodule
```
    git submodule init
    git submodule update
```
* start the server
```
    pm2 start server.js
```

#### Dev mode

Use webpack dev server for more convenient development. It is the best to create stubs inside the {before} property in webpack.config.js just like in the example:
```
        before: (app) => {
            app.get('/getLanguage/*', (req, res) => {
                let urlArr = req.url.split('/');
                let language = urlArr[urlArr.length - 1];
                res.json(JSON.parse(fs.readFileSync(`./data/${language}.json`, { encoding : 'utf-8' })));
            });
            app.get('/getPairs', (req, res) => {
                res.json(JSON.parse(fs.readFileSync(`./data/pairs.json`, { encoding : 'utf-8' })));
            });
            app.get('/getTokens', (req, res) => {
                res.json(JSON.parse(fs.readFileSync(`./data/tokens.json`, { encoding : 'utf-8' })));
            });
        }
```
It is easy to use because of similarity to express node-module.

Run dev server:
```
    npm run dev
```

#### Data structure

Acording the React.JS rules the app uses 'state' variable in order to bind properties of interface particles. It was realised side data structure and method to manage 'interface data' for a reason of inconvenience of using nested structures in the 'state'. Take a look at this structure:

![data_structure](doc_img/data_structure.png)

#### Frontend scheme

User interactions scheme. Red border page is the start page.

![front_scheme](doc_img/front_scheme.png)

#### Formulas for auto-complete

For more information about AMM DEX functional visit: https://github.com/Enecuum/internal-docs/blob/master/etp5.md
