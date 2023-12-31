import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { World, Body, Box as BoxC, Vec3, Plane, Material } from "cannon-es";

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
camera.position.set(0, 1, 30);
camera.lookAt(0, 0, 0);

// cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// shiba
let shiba;
const loader = new GLTFLoader();
loader.load(
  "shiba.glb",
  function (gltf) {
    gltf.scene.position.set(0, -9, -50);
    shiba = gltf.scene;
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// physics
const world = new World();
world.gravity.set(0, -9.82, 0);
const cubeShape = new BoxC(new Vec3(1, 1, 1));
const cubeBody = new Body({
  mass: 1,
  position: new Vec3(0, 5, 0),
  shape: cubeShape,
  material: new Material({ restitution: 1.0 }),
});
world.addBody(cubeBody);

const groundShape = new Plane();
const groundBody = new Body({
  mass: 0,
  material: new Material({ restitution: 1.0 }),
});
groundBody.addShape(groundShape);
groundBody.position.set(0, -10, 0);
groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
ground.position.copy(groundBody.position);
world.addBody(groundBody);

function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60);
  cube.position.copy(cubeBody.position);
  cube.quaternion.copy(cubeBody.quaternion);

  // shiba animation
  if (shiba) {
    shiba.position.x += 0.0;
    shiba.position.y += 0.0;
    shiba.position.z += 0.08;
  }

  renderer.render(scene, camera);
}
animate();
