import GIF from 'gifuct-js';

self.addEventListener('message', async (event) => {
  const gifURL = event.data;

  try {
    const response = await fetch(gifURL);
    const buffer = await response.arrayBuffer();
    const gif = new GIF(buffer);
    const frames = gif.frames;
    const spriteSheetCanvas = new OffscreenCanvas(gif.width * frames.length, gif.height);
    const ctx = spriteSheetCanvas.getContext('2d');

    frames.forEach((frame, index) => {
      ctx.putImageData(frame, gif.width * index, 0);
    });

    const blob = await spriteSheetCanvas.convertToBlob();
    const dimensions = { width: gif.width, height: gif.height };

    self.postMessage({ blob, dimensions, frames });
  } catch (error) {
    console.error('Error loading GIF:', error);
  }
});
