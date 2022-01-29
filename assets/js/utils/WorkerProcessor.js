class WorkerProcessor {
    constructor() {
        this.workers = []
        this.e2eId = 0
    }

    _findById (id) {
        return this.workers.find(worker => worker.id === id)
    }

    spawn (url) {
        let newWorker = new Worker(url)
        let id = this.e2eId++
        this.workers.push({
            id : id,
            simpleWorker : newWorker,
            message : null
        })

        newWorker.onmessage = (e) => {
            let worker = this._findById(id)
            if (worker)
                worker.message = e.data
        }
        return id
    }

    postMessage (id, message) {
        return new Promise((resolve, reject) => {
            let worker = this._findById(id)
            if (worker) {
                worker.simpleWorker.postMessage(message)
                let descriptor = setInterval(() => {
                    if (worker.message !== null) {
                        clearInterval(descriptor)
                        resolve(worker.message)
                        worker.message = null
                    }
                }, 500)
            } else
                reject()
        })
    }

    close (id) {
        let worker = this._findById(id)
        if (worker)
            worker.simpleWorker.terminate()
        this.workers = this.workers.filter(el => el.id !== id)
    }
}

let workerProcessor = new WorkerProcessor()

export default workerProcessor
