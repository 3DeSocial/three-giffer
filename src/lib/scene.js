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


const createSpheresWithGifTextures = async (urls) => {
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

  const spheres = [];
  const frameSets = [];

  for (const url of urls) {
    const [spritesheetTexture, frames] = await loadGifAsSpritesheet(url);

    const geometry = new THREE.SphereGeometry(2.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: spritesheetTexture });
    const sphere = new THREE.Mesh(geometry, material);

    spheres.push(sphere);
    frameSets.push(frames);
    scene.add(sphere);
  }

  // Position spheres in a horizontal circle
  const circleRadius = 10;
  const angleBetweenSpheres = (2 * Math.PI) / spheres.length;
  spheres.forEach((sphere, index) => {
    sphere.position.x = circleRadius * Math.cos(index * angleBetweenSpheres);
    sphere.position.z = circleRadius * Math.sin(index * angleBetweenSpheres);
  });

  camera.position.z = 20;
  camera.position.y = 10;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const clock = new THREE.Clock();

  const currentFrames = new Array(urls.length).fill(0);
  const frameElapsedTimes = new Array(urls.length).fill(0);
  let rotationAngle = 0;
  const rotationSpeed = 0.01;

  const animate = () => {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta() * 1000; // Convert to milliseconds

    spheres.forEach((sphere, index) => {
      const frames = frameSets[index];
      const frameDelay = frames[currentFrames[index]].delay || 100;
      if (frameElapsedTimes[index] >= frameDelay) {
        currentFrames[index] = (currentFrames[index] + 1) % frames.length;
        sphere.material.map.offset.x = currentFrames[index] / frames.length;
        frameElapsedTimes[index] = 0;
      } else {
        frameElapsedTimes[index] += deltaTime;
      }
    });

    // Rotate the circle of spheres
    rotationAngle += rotationSpeed;
    spheres.forEach((sphere, index) => {
      const angle = index * angleBetweenSpheres + rotationAngle;
      sphere.position.x = circleRadius * Math.cos(angle);
      sphere.position.z = circleRadius * Math.sin(angle);
      sphere.rotation.x += 0.01;
      sphere.rotation.y += 0.01;      
    });

    renderer.render(scene, camera);
  };

  animate();
};

export const createScene = (el) => {
  createSpheresWithGifTextures([
    'starwarscats.gif',
    'dankata.gif',
    'star-wars-tie-fighter.gif',
    'sabers.gif',
    'yay.gif'
  ]);
};

