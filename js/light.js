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

// cube
const geometry = new THREE.BoxGeometry(3, 3, 3);
const material = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.set(0, 1.5, 10);

// light
const light = new THREE.PointLight(0xffffff, 3000, 100);
light.position.set(0, 20, 20);
scene.add(light);

// ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  cube.rotation.y += 0.03;
}
animate();
