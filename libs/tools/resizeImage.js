let { Worker, } = require('worker_threads');

const resizeImage = (image, sizes, outputDir, imageName, toExtensions, fit) => {
  return new Promise((resolve, reject) => {

    let worker = new Worker(`${__dirname}/workers/resizeImages.js`, {
      workerData: {
        image,
        sizes,
        outputDir, 
        imageName,
        toExtensions,
        fit,
      }
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });

  });
}

module.exports = resizeImage;