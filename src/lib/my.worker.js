import * as THREE from 'three';

self.onmessage = (event) => {
  console.log('message recieved');
  const {
    sharedBuffer,
    spheresCount,
    angleBetweenSpheres,
    rotationSpeed,
    frameSets,
  } = event.data;
  const sharedArray = new Float64Array(sharedBuffer);
console.log(event.data);
  const clock = new THREE.Clock();

  const   updatePositionsAndOffsets = () => {
    const deltaTime = clock.getDelta()
    const circleRadius = 15;;
    sharedArray[0] += deltaTime;

    for (let i = 0; i < spheresCount; i++) {
      const angle = angleBetweenSpheres * i + sharedArray[0] * rotationSpeed;
      const x = circleRadius * Math.cos(angle);
      const z = circleRadius * Math.sin(angle);

      sharedArray[1 + spheresCount * 3 + i * 2] = x;
      sharedArray[1 + spheresCount * 3 + i * 2 + 1] = z;

      const frameDuration = frameSets[i][0].delay | 100;
      console.log('frameDuration: ',frameDuration);;
      sharedArray[1 + spheresCount + i] = (sharedArray[1 + spheresCount + i] + deltaTime) % (frameSets[i].length * frameDuration);
    }

    setTimeout(updatePositionsAndOffsets, 1000 / 60); // Update at approximately 60 FPS
  };

  updatePositionsAndOffsets();
};
