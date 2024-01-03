import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  500
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// camera
camera.position.set(0, 10, 50);
camera.lookAt(0, 0, -50);

// cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.set(0, 0.5, 0);

// light
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);

// tile floor
const tileWidth = 5; // タイルの幅
const tileHeight = 5; // タイルの高さ
const tilesX = 20; // X方向のタイル数
const tilesY = 20; // Y方向のタイル数

for (let i = 0; i < tilesX; i++) {
  for (let j = 0; j < tilesY; j++) {
    const geometry = new THREE.PlaneGeometry(tileWidth, tileHeight);
    const material = new THREE.MeshLambertMaterial({
      color: (i + j) % 2 === 0 ? 0x666666 : 0x333333,
    });
    const tile = new THREE.Mesh(geometry, material);
    tile.position.x = i * tileWidth - 50;
    tile.position.z = j * tileHeight - 50;
    tile.position.y = 0;
    tile.rotation.x = -Math.PI / 2;
    scene.add(tile);
  }
}

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

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
