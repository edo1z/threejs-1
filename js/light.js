import * as THREE from "three";

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

// texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('../texture/cube_texture.png');

const geometry = new THREE.BoxGeometry(3, 3, 3);
const material = new THREE.MeshLambertMaterial({ map: texture });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.set(0, 1.5, 10);

// light
const light = new THREE.PointLight(0xffffff, 300, 100);
light.position.set(0, 10, 30);
scene.add(light);

// ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x8899ff });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  cube.rotation.y += 0.01;
}
animate();
