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

}

module.exports = ImageProcessing;