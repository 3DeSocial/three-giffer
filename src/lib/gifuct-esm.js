import GIF from 'gifuct-js';

// Wrap the GIF object in a default export
export default  function (buffer) {
  return new GIF(buffer);
}