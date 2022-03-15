# ENEX tests

---

### Prerequisites
* Install dependencies
```shell
    npm i
```
* Install enecuum extension on your PC
* Set a test configuration
```json
    {
      "account" : {
        "prvkey" : "your test wallet private key",
        "pubkey" : "your test wallet public key",
        "password" : "new test wallet password"
      },
      "chromeExtension" : {
        "path" : "/path/to/enecuum/extension",
        "url" : "chrome-extension://ebfdhaidmglmcfcgnmdjnekihfdaoibn/index.html"
      }
    }
```
* Set environment variable "HEADLESS" to false if you want to launch a full version of Chromium

### Developer tools
* To get complex element selectors it is necessary to use "Headless Recorder" Chrome extension

### Run tests
* Check configs into file jest.config.js (You can find options here: https://jestjs.io/docs/configuration#options)
* Run ENEX backend
````shell
    npm run dev
````
* Run test plug
```shell
    npm run dev:test
```  
* Run jest by command
```shell
    jest {file.test.js}
```