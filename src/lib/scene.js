import * as THREE from 'three';
import { parseGIF, decompressFrames } from 'gifuct-js';
import workerURL from '$lib/my.worker.js?url';
const scene = new THREE.Scene();
let skyMesh = null;
let worker = null;
const loadWorker = async () => {

  worker = new Worker(workerURL, { type: "module" });
};


const loadSkybox = ()=>{
    let that = this;

    const geometry = new THREE.SphereGeometry( 500, 60, 40 );
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry.scale( - 1, 1, 1 );
    let fullImagePath = '/scifi_star_wars_imperial_fleet_in_deep_space.jpg';
    try{
      let loader = new THREE.TextureLoader();
      loader.load(
          fullImagePath,
          function ( texture ) {
              // create a material using the loaded texture

              const material = new THREE.MeshBasicMaterial( { map: texture } );

              skyMesh = new THREE.Mesh( geometry, material );

              
              scene.add( skyMesh );
          },
          function ( xhr ) {
              console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
          },
          function ( error ) {
              console.error( 'An error happened', error );
          }
      );
    } catch(error){
        console.log('could not load texture');
        console.log(error);
    }
}


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

const createSpheresWithGifTextures = async (gifUrls, circleRadius, sphereDiameter, distanceBetweenSpheres) => {

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 50;
  camera.position.y = 15;  
  camera.lookAt(new THREE.Vector3(0,0,0));
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  let rotationSpeed = 1; 
  const spheres = [];
  const sharedBuffer = new SharedArrayBuffer(Float64Array.BYTES_PER_ELEMENT * (1 + gifUrls.length * 5));
  const sharedArray = new Float64Array(sharedBuffer);
  const gifFrameSets = await Promise.all(gifUrls.map(loadGifAsSpritesheet));
  const geometry = new THREE.SphereGeometry(5, 32, 32);

  const angleBetweenSpheres = (2 * Math.PI) / gifUrls.length;

  let frameSets = [];
  gifFrameSets.forEach((frameSet, index) => {
    const [spritesheetTexture, frames] = frameSet;
    frameSets.push(frames);

    const material = new THREE.MeshBasicMaterial({ map: spritesheetTexture });
    const sphere = new THREE.Mesh(geometry, material);
    const angle = angleBetweenSpheres * index;
    sphere.position.set(circleRadius * Math.cos(angle), 0, circleRadius * Math.sin(angle));
    scene.add(sphere);
    spheres.push(sphere);
  });

  worker.postMessage({
    sharedBuffer,
    spheresCount: spheres.length,
    angleBetweenSpheres,
    rotationSpeed,
    frameSets,
    sphereDiameter,
    distanceBetweenSpheres
  });

  const animate = () => {
    requestAnimationFrame(animate);

    spheres.forEach((sphere, index) => {
      sphere.position.set(sharedArray[1 + gifUrls.length * 3 + index * 2], 0, sharedArray[1 + gifUrls.length * 3 + index * 2 + 1]);
      if (sphere.material.map) {
        sphere.material.map.offset.x = sharedArray[1 + gifUrls.length + index] / frameSets[index].length;
      }
    });

    if(skyMesh){
      skyMesh.rotation.y -= 0.001;
    }
    renderer.render(scene, camera);
  };

  animate();
};



export const createScene = (el) => {


  loadWorker();

  loadSkybox();
  createSpheresWithGifTextures([
    'starwarscats.gif',
    'dankata.gif',
    'star-wars-tie-fighter.gif',
    'sabers.gif',
    'yay.gif',
    'starwarscats.gif',
    'dankata.gif',
    'star-wars-tie-fighter.gif',
    'sabers.gif',
    'yay.gif',
    'starwarscats.gif',
    'dankata.gif',
    'star-wars-tie-fighter.gif',
    'sabers.gif',
    'yay.gif',
    'starwarscats.gif',
    'dankata.gif',
    'star-wars-tie-fighter.gif',
    'sabers.gif',
    'yay.gif',
    'starwarscats.gif',
    'dankata.gif',
    'star-wars-tie-fighter.gif',
    'sabers.gif',
    'yay.gif'
  ],15, 5, 10);
};
