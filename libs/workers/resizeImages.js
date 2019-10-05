let { parentPort, workerData, } = require('worker_threads');
let sharp = require('sharp');

async function resize() {
  const { image, sizes, outputDir, imageName=Date.now(), toExtention='png', fit="cover" } =  workerData;
  const _shapImagesPromise = sizes.map( size => {
    let { width, height } = typeof size === 'object' ? size : { width: size, height: size};
    const outputPath  =  `${outputDir}/${imageName}-${width}x${height}.${toExtention}`;
    return sharp(image)
    .resize(width, height, { fit })
    .toFile(outputPath);
  });

  _res = await Promise.all([..._shapImagesPromise]);
  parentPort.postMessage(_res);
}

resize();
