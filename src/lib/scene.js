import * as THREE from 'three';
import { parseGIF, decompressFrames } from 'gifuct-js'
var frameImageData;
var tempCanvas = document.createElement('canvas')
var tempCtx = tempCanvas.getContext('2d')

const drawPatch =(frame, gifCtx, gifWidth, index) =>{
  var dims = frame.dims

  if (
    !frameImageData ||
    dims.width != frameImageData.width ||
    dims.height != frameImageData.height
  ) {
    tempCanvas.width = dims.width
    tempCanvas.height = dims.height
    frameImageData = tempCtx.createImageData(dims.width, dims.height)
  }

  // set the patch data as an override
  frameImageData.data.set(frame.patch)

  // draw the patch back over the canvas
  tempCtx.putImageData(frameImageData, 0, 0)

    console.log('gifCtx: ',gifCtx);
    console.log(tempCanvas, dims.left, dims.top)
    gifCtx.putImageData(frameImageData, gifWidth * index, 0);

}

var edge = function(data, output) {
  var odata = output.data
  var width = gif.lsd.width
  var height = gif.lsd.height

  var conv = [-1, -1, -1, -1, 8, -1, -1, -1, -1]
  var halfside = Math.floor(3 / 2)

  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var r = 0,
        g = 0,
        b = 0
      for (var cy = 0; cy < 3; cy++) {
        for (var cx = 0; cx < 3; cx++) {
          var scy = y - halfside + cy
          var scx = x - halfside + cx

          if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
            var src = (scy * width + scx) * 4
            var f = cy * 3 + cx
            r += data[src] * conv[f]
            g += data[src + 1] * conv[f]
            b += data[src + 2] * conv[f]
          }
        }
      }

      var i = (y * width + x) * 4
      odata[i] = r
      odata[i + 1] = g
      odata[i + 2] = b
      odata[i + 3] = 255
    }
  }

  return output
}

export const createScene = (el) => {

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load and process GIF
const gifURL = '/pix.gif';

fetch(gifURL)
  .then((response) => response.arrayBuffer())
  .then((buffer) => {
    const gif = parseGIF(buffer);
    const frames = decompressFrames(gif, true);
    const spriteSheetCanvas = document.createElement('canvas');
    const ctx = spriteSheetCanvas.getContext('2d');
    const gifWidth = gif.lsd.width;
    const gifHeight = gif.lsd.height;
    const spriteSheetWidth = gif.lsd.width * frames.length;
    const spriteSheetHeight = gif.lsd.height;

    spriteSheetCanvas.width = spriteSheetWidth;
    spriteSheetCanvas.height = spriteSheetHeight;

    // Create the sprite sheet
    frames.forEach((frame, index) => {
        console.log('frame on canvas: ',index);
        console.log(frame);
        drawPatch(frame, ctx,gifWidth, index);
    });
    console.log('spritesheet created');
document.body.appendChild(spriteSheetCanvas);
    const texture = new THREE.Texture(spriteSheetCanvas);
    texture.needsUpdate = true;

    // Create a mesh with a custom shader material
    const geometry = new THREE.PlaneBufferGeometry(gifWidth, gifHeight);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        spriteSheet: { value: texture },
        spriteCount: { value: frames.length },
        currentSprite: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D spriteSheet;
        uniform float spriteCount;
        uniform float currentSprite;
        varying vec2 vUv;
        void main() {
          float spriteWidth = 1.0 / spriteCount;
          float xOffset = currentSprite * spriteWidth;
          vec2 spriteUv = vec2(xOffset + vUv.x * spriteWidth, vUv.y);
          gl_FragColor = texture2D(spriteSheet, spriteUv);
        }
      `,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    camera.lookAt(mesh);
    // Animate the mesh
    let currentFrame = 0;

    function animate() {
      requestAnimationFrame(animate);

      currentFrame++;
      if (currentFrame >= frames.length) {
        currentFrame = 0;
      };
      material.uniforms.currentSprite.value = currentFrame;

      // Set the delay for the current frame based on the gif frame delay
      const delay = frames[currentFrame].delay;
      setTimeout(() => {
        renderer.render(scene, camera);
      }, delay);
    }

    animate();
  })
  .catch((error) => console.error('Error loading GIF:', error));
 
};

