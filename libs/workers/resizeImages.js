let { parentPort, workerData, } = require('worker_threads');
let sharp = require('sharp');

async function resize() {
  const { image, sizes, outputDir, imageName=Date.now(), toExtentions='png', fit="cover" } =  workerData;
  const _shapImagesPromise = sizes.map( size => {
    let { width, height } = typeof size === 'object' ? size : { width: size, height: size};
    const outputPath  =  `${outputDir}/${imageName}-${width}x${height}`;
    const _currentImage = sharp(image).resize(width, height, { fit });
    if( !Array.isArray(toExtentions) ) {
      return _currentImage.toFile(`${outputPath}.${toExtentions}`);
    }
  });

  _res = await Promise.all([..._shapImagesPromise]);
  parentPort.postMessage(_res);
}

resize();
