let { parentPort, workerData, } = require('worker_threads');
let sharp = require('sharp');

async function resize() {
  const { image, sizes, outputDir, imageName=Date.now(), toExtensions='png', fit="cover" } =  workerData;
  let _shapImagesPromise = [];
  sizes.map( size => {
    let { width, height } = typeof size === 'object' ? size : { width: size, height: size};
    const _outputPath  =  `${outputDir}/${imageName}-${width}x${height}`;
    const _currentImage = sharp(image).resize(width, height, { fit });

    if( !Array.isArray(toExtensions) ) {
      _shapImagesPromise = [
        ..._shapImagesPromise, 
        _currentImage.png().toFile(`${_outputPath}.${toExtensions}`)
      ];
    } else {
      toExtensions.forEach( extension => {
        switch (extension) {
          case 'webp':
            _shapImagesPromise = [
              ..._shapImagesPromise, 
              _currentImage.webp({ lossless: true, }).toFile(`${_outputPath}.${extension}`)
            ];
            break;
          case 'jpeg':
            _shapImagesPromise = [
              ..._shapImagesPromise, 
              _currentImage.jpeg().toFile(`${_outputPath}.${extension}`)
            ];
            break;
          default: 
            _shapImagesPromise = [
              ..._shapImagesPromise, 
              _currentImage.png().toFile(`${_outputPath}.${extension}`)
            ];
        }
      });
    }
  });

  let _res
  try {
    _res = await Promise.all(_shapImagesPromise);
  } catch (error) {
    _res = error;  
  }
  parentPort.postMessage(_res);
}

resize();
