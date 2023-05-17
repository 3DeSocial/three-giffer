import * as THREE from 'three';
import { parseGIF, decompressFrames } from 'gifuct-js';
import workerURL from '$lib/my.worker.js?url';
const scene = new THREE.Scene();
let skyMesh = null;
let worker = null;
let camera = null, renderer = null, spheresCount = null;
const loadWorker = async () => {

  worker = new Worker(workerURL, { type: "module" });

    worker.onmessage = (event) => {
      console.log('event: ',event);
    switch(event.data.method){
      case 'sharedArrayUpdate':
      break;
      case 'prepareGifs':
        startAnimation(event.data.payload);
      } 
  }
}

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

const initScene = ()=>{
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 50;
  camera.position.y = 15;  
  camera.lookAt(new THREE.Vector3(0,0,0));
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);  
}

const startAnimation = async (spriteSheetData) => {
  let circleRadius = 15,sphereDiameter = 5, distanceBetweenSpheres = 10;
  let rotationSpeed = 1; 
  const spheres = [];
  const sharedBuffer = new SharedArrayBuffer(Float64Array.BYTES_PER_ELEMENT * (1 + spriteSheetData.length * 5));
  const sharedArray = new Float64Array(sharedBuffer);


  const geometry = new THREE.SphereGeometry(5, 32, 32);

  const angleBetweenSpheres = (2 * Math.PI) / spriteSheetData.length;

  let frameSetLengths = [];
  spriteSheetData.forEach((spriteSheet, index) => {

    const imageBitmap = spriteSheet.spriteSheet;

    const spritesheetTexture = new THREE.Texture(imageBitmap);
    spritesheetTexture.repeat.set(1 / spriteSheetData.length, 1);
    spritesheetTexture.needsUpdate = true;    

/*
  // Convert the spritesheet texture to a data URL
  const canvas = document.createElement('canvas');
  canvas.width = spritesheetTexture.image.width;
  canvas.height = spritesheetTexture.image.height;
  const context = canvas.getContext('2d');
  context.drawImage(spritesheetTexture.image, 0, 0);
  const dataURL = canvas.toDataURL();

  // Create an <img> element and set its src attribute to the data URL
  const img = document.createElement('img');
  img.src = dataURL;

  // Append the <img> element to the document body for debugging
  document.body.appendChild(img);
*/
    const frameCount = spriteSheet.frameCount; 
    frameSetLengths.push(frameCount);

    const material = new THREE.MeshBasicMaterial({ map: spritesheetTexture });
    const sphere = new THREE.Mesh(geometry, material);
    const angle = angleBetweenSpheres * index;
    sphere.position.set(circleRadius * Math.cos(angle), 0, circleRadius * Math.sin(angle));
    scene.add(sphere);
    spheres.push(sphere);
  });
  spheresCount = spheres.length;
  worker.postMessage({method:'animate',
    data:{
      sharedBuffer,
      spheresCount,
      angleBetweenSpheres,
      rotationSpeed,
      frameSetLengths,
      sphereDiameter,
      distanceBetweenSpheres
    }}
  );


  const animate = () => {
    requestAnimationFrame(animate);

    spheres.forEach((sphere, index) => {

      const sphereXIndex = 1 + spheresCount * 3 + index * 2;
      const sphereZIndex = 1 + spheresCount * 3 + index * 2 + 1;
      const sphereYIndex = 1 + spheresCount * 3 + index * 2 + 2; 

      sphere.position.set(
        sharedArray[sphereXIndex],
        sharedArray[sphereZIndex], // Use the y-coordinate index
        sharedArray[sphereYIndex]
      );
      if (sphere.material.map) {
        sphere.material.map.offset.x = sharedArray[1 + spheres.length + index] / frameSetLengths[index];
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
  initScene();
  loadSkybox();

  

  let gifUrls = [
    '/starwarscats.gif',
    '/dankata.gif',
    '/star-wars-tie-fighter.gif',
    '/sabers.gif',
    '/yay.gif',
    '/starwarscats.gif',
    '/dankata.gif',
    '/star-wars-tie-fighter.gif',
    '/sabers.gif',
    '/yay.gif',
    '/starwarscats.gif',
    '/dankata.gif',
    '/star-wars-tie-fighter.gif',
    '/sabers.gif',
    '/yay.gif',
    '/starwarscats.gif',
    '/dankata.gif',
    '/star-wars-tie-fighter.gif',
    '/sabers.gif',
    '/yay.gif',
    '/starwarscats.gif',
    '/dankata.gif',
    '/star-wars-tie-fighter.gif',
    '/sabers.gif',
    '/yay.gif',
    '/starwarscats.gif',
    '/dankata.gif',
    '/star-wars-tie-fighter.gif',
    '/sabers.gif',
    '/yay.gif',
    '/starwarscats.gif',
    '/dankata.gif',
    '/star-wars-tie-fighter.gif',
    '/sabers.gif',
    '/yay.gif',
    '/starwarscats.gif',
    '/dankata.gif',
    '/star-wars-tie-fighter.gif',
    '/sabers.gif',
    '/yay.gif',
    '/starwarscats.gif',
    '/dankata.gif',
    '/star-wars-tie-fighter.gif',
    '/sabers.gif',
    '/yay.gif',
    '/starwarscats.gif',
    '/dankata.gif',
    '/star-wars-tie-fighter.gif',
    '/sabers.gif',
    '/yay.gif'    
  ];

  worker.postMessage({method:'prepareGifs',
  data:gifUrls});    
};
