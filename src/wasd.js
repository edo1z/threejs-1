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
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.set(0, 0.5, 10);

// ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

let moveSpeed = 0.3;

let keyState = {};
window.addEventListener('keydown',function(e){
    keyState[e.key] = true;
},true);
window.addEventListener('keyup',function(e){
    keyState[e.key] = false;
},true);

function animate() {
  if (keyState['w']) cube.position.z -= moveSpeed;
  if (keyState['s']) cube.position.z += moveSpeed;
  if (keyState['a']) cube.position.x -= moveSpeed;
  if (keyState['d']) cube.position.x += moveSpeed;

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
