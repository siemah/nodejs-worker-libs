let { Worker, } = require('worker_threads');

/**
 * call a worker 2 resize a list of images and receive data then
 * resolve/reject reseponse from worker as promise
 * @param {string} image path of image to resize
 * @param {array[object|number]} sizes the size of images to make 
 * @param {string} outputDir destination directory
 * @param {string} imageName final name of image
 * @param {string|array[string]} toExtensions list of image kind png, webp ..
 * @param {string} fit see sharp doc @see https://sharp.pixelplumbing.com/en/stable/api-resize/#parameters
 * @return {Promise<any>} contain data of resizing or error object
 * @see https://sharp.pixelplumbing.com/en/stable/api-output/#tofile
 */
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