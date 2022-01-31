class WorkerProcessor {
    constructor() {
        this.workers = []
        this.e2eId = 0
    }

    _findById (id) {
        return this.workers.find(worker => worker.id === id)
    }

    spawn (url) {
        if (!window.Worker)
            return null

        let workerObj = {
            id : this.e2eId++,
            simpleWorker : new Worker(url),
            message : null
        }
        this.workers.push(workerObj)

        workerObj.simpleWorker.onmessage = (e) => {
            let worker = this._findById(workerObj.id)
            if (worker)
                worker.message = e.data
        }
        workerObj.postMessage = this._postMessage.bind(workerObj)
        workerObj.close = this._close.bind(this, workerObj)

        return workerObj
    }

    _postMessage (message) {
        return new Promise((resolve, reject) => {
            this.simpleWorker.postMessage(message)

            let timeoutDescriptor = setTimeout(() => {
                clearInterval(intervalDescriptor)
                reject()
            }, 10 * 1000)
            let intervalDescriptor = setInterval(() => {
                if (this.message !== null) {
                    clearTimeout(timeoutDescriptor)
                    clearInterval(intervalDescriptor)
                    resolve(this.message)
                    this.message = null
                }
            }, 500)
        })
    }

    _close (worker) {
        worker.simpleWorker.terminate()
        this.workers = this.workers.filter(el => el.id !== worker.id)
    }
}

let workerProcessor = new WorkerProcessor()

export default workerProcessor
