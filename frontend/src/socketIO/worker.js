const { Worker } = require('worker_threads')
const path = require('path')

const NUM_WORKERS = 1 // Number of worker threads to create

function runWorkers() {
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = new Worker('../socketIO/loadTest.js')
    worker.on('error', (error) => {
      console.error('Worker error:', error)
    })
    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`)
      }
    })
  }
}

runWorkers()
