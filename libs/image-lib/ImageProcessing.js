const { Worker, } = require('worker_threads');
const imagemin = require('imagemin');
const pngquant = require('imagemin-pngquant');
const jpgquant = require('imagemin-jpegtran');
const webpquant = require('imagemin-webp');

const config = require('./config/options.json');

/**
 * make a simple tools to process image resizing and compressing
 * using sharp for resizing and imagemin for compressing
 */


class ImageProcessing {

  getMinifyConfiguration(source, minifyAll = false) {
    return new Promise((resolve, reject) => {
      if(!source) 
        reject(new Error('You must specify at least the source params, null/undefined given'));
      
      let { png, webp, jpg } = config;
      let _ext = source.substr(source.lastIndexOf('.') + 1);
      _ext = _ext.toString().includes(['jpeg', 'jpg']) ? 'jpg' : _ext;
      let plugins ;
      if (minifyAll) {
        plugins = [webpquant(webp), pngquant(png), jpgquant(jpg)];
      } else {
        switch (_ext) {
          case 'png':
            plugins = [pngquant(png)];
            break;
          case 'webp':
            plugins = [webpquant(webp)];
            break;
          case 'jpg':
            plugins = [jpgquant(jpg)];
            break;
          default:
            plugins = [pngquant(png), jpgquant(jpg)];
            break;
        }
      }

      resolve({ plugins, });
    });
  }

  /**
   * minify the size of images
   * @param {object} options containt file source or pattern, destination props
   * @return {Promise<any>}
   * @see https://github.com/imagemin/imagemin
   */
  minify(options) {
    return new Promise( async (resolve, reject) => {
      if (!options) 
        reject(new Error(`Options params is missing`));
      if (!options.source || typeof options.source !== 'string')
        reject(new Error(`Source props is required`));
      
      let { source, destination, } = options;
      let {plugins} = await this.getMinifyConfiguration(source); 
      
      try {
        let data = await imagemin(
          [source], 
          {
            destination,
            plugins,
          }
        );
        resolve(data);
      } catch (error) {
        reject(error);
      }

    });
  }

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
  resizeImage(image, sizes, outputDir, imageName, toExtensions, fit) {
    return new Promise((resolve, reject) => {

      if(typeof image !== 'string' || typeof outputDir !== 'string')
        reject('Wrong image or destination directory path. they must be of string type');
      if(!Array.isArray(toExtensions))
        reject('You must passe a list of extensions as an array');

      let worker = new Worker(
        `${__dirname}/workers/resizeImages.js`, 
        {
          workerData: {
            image,
            sizes,
            outputDir,
            imageName,
            toExtensions,
            fit,
          }
        }
      );

      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', code => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });

    });
  }

}

module.exports = ImageProcessing;