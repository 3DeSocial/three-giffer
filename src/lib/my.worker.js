import * as THREE from 'three';

import { parseGIF, decompressFrames } from 'gifuct-js';

const prepareGifs = async (gifUrls) => {
  console.log('worker gifUrls: ',gifUrls);
  try {
    const spritesheets = await Promise.all(gifUrls.map(loadSpritesheet));
    const transferableSpritesheets = spritesheets.map((spritesheetData) => {
  
      return {spriteSheet:spritesheetData[0].transferToImageBitmap(),frameCount:spritesheetData[1]}
    });

    self.postMessage({method: 'prepareGifs',payload: transferableSpritesheets});
  } catch (error) {
    console.error('Error loading GIFs:', error);
  }
};

const fetchGifData = async (url) => {

  return await fetch(url);;
};

const createSpritesheet = (frames) => {
  const offscreenCanvas = new OffscreenCanvas(frames[0].dims.width * frames.length, frames[0].dims.height);
  const ctx = offscreenCanvas.getContext('2d');
  
  frames.forEach((frame, index) => {
    const frameImageData = new ImageData(
      new Uint8ClampedArray(frame.patch.buffer),
      frame.dims.width,
      frame.dims.height
    );
    ctx.putImageData(frameImageData, index * frame.dims.width, 0);
  });
  
  return offscreenCanvas;
};

const loadSpritesheet = async (gifUrl) => {
  const response = await fetch(gifUrl);
  const buffer = await response.arrayBuffer();
  const gif = parseGIF(buffer);
  const frames = decompressFrames(gif, true);
  const spritesheetCanvas = createSpritesheet(frames);
  return [spritesheetCanvas, frames.length];
};

self.onmessage = (event) => {

  switch(event.data.method){
    case 'animate':
      animate(event.data.data);
    break;
    case 'prepareGifs':
      prepareGifs(event.data.data);
    break;
  }
}

const animate = (data)=>{
  const {
    sharedBuffer,
    spheresCount,
    angleBetweenSpheres,
    rotationSpeed,
    frameSetLengths,
    sphereDiameter,
    distanceBetweenSpheres
  } = data;
  const sharedArray = new Float64Array(sharedBuffer);
  const clock = new THREE.Clock();


  const frameSpeedFactor = 0.05;
  const circleRadius = (sphereDiameter + distanceBetweenSpheres) * spheresCount / (2 * Math.PI);

  const updatePositionsAndOffsets = () => {
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    sharedArray[0] += deltaTime;

    for (let i = 0; i < spheresCount; i++) {
      const angle = angleBetweenSpheres * i + sharedArray[0] * rotationSpeed;

      const sphereXIndex = 1 + spheresCount * 3 + i * 2;
      const sphereZIndex = 1 + spheresCount * 3 + i * 2 + 1;
      const sphereYIndex = 1 + spheresCount * 3 + i * 2 + 2; // New index for y-coordinate
  
      sharedArray[sphereXIndex] = circleRadius * Math.cos(angle);
      sharedArray[sphereZIndex] = circleRadius * Math.sin(angle);
  
      // Calculate y-coordinate using sine wave pattern
      const amplitude = 0; // Amplitude of the sine wave
      const frequency = 0; // Frequency of the sine wave
      const y = amplitude * Math.sin(elapsedTime * frequency);
      sharedArray[sphereYIndex] = y;
  

      const frameElapsedIndex = 1 + spheresCount + i;
      const frameIndex = Math.floor(elapsedTime / frameSpeedFactor) % frameSetLengths[i];
      sharedArray[frameElapsedIndex] = frameIndex;
    }

    setTimeout(updatePositionsAndOffsets, 1000 / 60); // Update at approximately 60 FPS
  };

  updatePositionsAndOffsets();
};
