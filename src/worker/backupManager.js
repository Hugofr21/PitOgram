const path = require('path');
const { Worker } = require('worker_threads');

function backup() {
    const worker = new Worker(path.join(__dirname, 'backupWorker.js'));
  
    worker.on('message', (message) => {
        console.log(message);
    });
  
    worker.on('error', (error) => {
        console.error('Worker error:', error);
    });
  
    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
}
  