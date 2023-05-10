import * as THREE from 'three';

self.onmessage = (event) => {
  console.log('message received');
  const {
    sharedBuffer,
    spheresCount,
    angleBetweenSpheres,
    rotationSpeed,
    frameSets,
    sphereDiameter,
    distanceBetweenSpheres
  } = event.data;
  const sharedArray = new Float64Array(sharedBuffer);
  const clock = new THREE.Clock();
console.log('spheresCount: ',spheresCount);
console.log('sphereDiameter: ',sphereDiameter);
console.log('distanceBetweenSpheres: ',distanceBetweenSpheres);

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
      sharedArray[sphereXIndex] = circleRadius * Math.cos(angle);
      sharedArray[sphereZIndex] = circleRadius * Math.sin(angle);

      const frameElapsedIndex = 1 + spheresCount + i;
      const frameIndex = Math.floor(elapsedTime / frameSpeedFactor) % frameSets[i].length;
      sharedArray[frameElapsedIndex] = frameIndex;
    }

    setTimeout(updatePositionsAndOffsets, 1000 / 60); // Update at approximately 60 FPS
  };

  updatePositionsAndOffsets();
};