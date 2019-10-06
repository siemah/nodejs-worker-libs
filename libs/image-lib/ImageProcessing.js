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

  /**
   * 0- check if all needed options are passed
   * 1- need source to image file
   * 2- destination directory
   * 3- 
   */
  minify(options) {
    return new Promise( async (resolve, reject) => {
      if(!options) 
        reject(new Error(`Options params is missing`));
      if(!options.source || typeof options.source !== 'string')
        reject(new Error(`Source props is required`));
      
      let { source, destination, } = options;
      let { png, webp, jpg } = config;
      let _ext = source.substr(source.lastIndexOf('.')+1);
      let plugins = 
        _ext === 'png'
          ? [pngquant(png)]
          : _ext === 'webp'
            ? [webpquant(webp)]
            : [jpgquant(jpg)];
      
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