import * as THREE from "three";

const createCube = (size, color) => {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshLambertMaterial({ color: color });
  const cube = new THREE.Mesh(geometry, material);
  return cube;
};

const createPlayer = (bodyColor, noseColor) => {
  const body = createCube(1, bodyColor);
  const nose = createCube(0.5, noseColor);
  body.position.set(0, 0.5, 0);
  nose.position.set(0, 0.5, -1);
  const group = new THREE.Group();
  group.add(body);
  group.add(nose);
  return group;
};

const createTileFloor = (tileWidth, tileHeight, tilesX, tilesY) => {
  for (let i = 0; i < tilesX; i++) {
    for (let j = 0; j < tilesY; j++) {
      const geometry = new THREE.PlaneGeometry(tileWidth, tileHeight);
      const material = new THREE.MeshLambertMaterial({
        color: (i + j) % 2 === 0 ? 0x666666 : 0x333333,
      });
      const tile = new THREE.Mesh(geometry, material);
      tile.position.x = i * tileWidth - (tileWidth * tilesX) / 2;
      tile.position.z = j * tileHeight - (tileHeight * tilesY) / 2;
      tile.position.y = 0;
      tile.rotation.x = -Math.PI / 2;
      scene.add(tile);
    }
  }
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  500
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// camera
camera.position.set(0, 10, 50);
camera.lookAt(0, 0, -50);

const player = createPlayer(0xffcc00, 0xcc2211);
scene.add(player);

// light
const light = new THREE.AmbientLight(0xffffff, 2);
scene.add(light);

// tile floor
createTileFloor(10, 10, 30, 30);

// skybox
const loader = new THREE.CubeTextureLoader();
loader.setPath("../skybox/");

const cubeTexture = loader.load([
  "px.jpg",
  "nx.jpg",
  "py.jpg",
  "ny.jpg",
  "pz.jpg",
  "nz.jpg",
]);

scene.background = cubeTexture;

let moveSpeed = 0.3;

let keyState = {};
window.addEventListener(
  "keydown",
  function (e) {
    keyState[e.key] = true;
  },
  true
);
window.addEventListener(
  "keyup",
  function (e) {
    keyState[e.key] = false;
  },
  true
);

// plyaer rotation
let playerRotation = 0;
document.addEventListener("mousemove", onMouseMove, false);
function onMouseMove(event) {
  const mouseX = (event.clientX / window.innerWidth) * 5 - 1;
  playerRotation = -mouseX * Math.PI;
  player.rotation.y = playerRotation;
}

function animate() {
  if (keyState["w"]) {
    player.position.x -= moveSpeed * Math.sin(playerRotation);
    player.position.z -= moveSpeed * Math.cos(playerRotation);
  }
  if (keyState["s"]) {
    player.position.x += moveSpeed * Math.sin(playerRotation);
    player.position.z += moveSpeed * Math.cos(playerRotation);
  }
  if (keyState["a"]) {
    player.position.x -= moveSpeed * Math.cos(playerRotation);
    player.position.z += moveSpeed * Math.sin(playerRotation);
  }
  if (keyState["d"]) {
    player.position.x += moveSpeed * Math.cos(playerRotation);
    player.position.z -= moveSpeed * Math.sin(playerRotation);
  }

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
