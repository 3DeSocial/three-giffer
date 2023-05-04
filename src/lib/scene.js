import * as THREE from 'three';
import { parseGIF, decompressFrames } from 'gifuct-js';

const createSpritesheet = (frames) => {
  const spritesheetCanvas = document.createElement('canvas');
  spritesheetCanvas.width = frames[0].dims.width * frames.length;
  spritesheetCanvas.height = frames[0].dims.height;
  spritesheetCanvas.style.display = 'none';
  const ctx = spritesheetCanvas.getContext('2d');

  frames.forEach((frame, index) => {
    const frameImageData = new ImageData(
      new Uint8ClampedArray(frame.patch.buffer),
      frame.dims.width,
      frame.dims.height
    );
    ctx.putImageData(frameImageData, index * frame.dims.width, 0);
  });

  return spritesheetCanvas;
};

const loadGifAsSpritesheet = async (url) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const gif = parseGIF(buffer);
  const frames = decompressFrames(gif, true);

  const spritesheetCanvas = createSpritesheet(frames);
  const spritesheetTexture = new THREE.CanvasTexture(spritesheetCanvas);
  spritesheetTexture.repeat.set(1 / frames.length, 1);

  return [spritesheetTexture, frames];
};


const createCubeWithGifTexture = async (url) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const [spritesheetTexture, frames] = await loadGifAsSpritesheet(url);

  const geometry = new THREE.BoxGeometry();
  const materials = [
    new THREE.MeshBasicMaterial({ map: spritesheetTexture }),
    new THREE.MeshBasicMaterial({ map: spritesheetTexture }),
    new THREE.MeshBasicMaterial({ map: spritesheetTexture }),
    new THREE.MeshBasicMaterial({ map: spritesheetTexture }),
    new THREE.MeshBasicMaterial({ map: spritesheetTexture }),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  ];
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);

  camera.position.z = 2;
  camera.position.y = 0;
  const clock = new THREE.Clock();

  let currentFrame = 0;
  let frameElapsedTime = 0;
  const animate = () => {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta() * 1000; // Convert to milliseconds
    const frameDelay = frames[currentFrame].delay || 100;
    if (frameElapsedTime >= frameDelay) {
      currentFrame = (currentFrame + 1) % frames.length;
      spritesheetTexture.offset.x = currentFrame / frames.length;
      frameElapsedTime = 0;
    } else {
      frameElapsedTime += deltaTime;
    }

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  };

  animate();
};

export const createScene = (el) => {
 
createCubeWithGifTexture('starwarscats.gif');
};

