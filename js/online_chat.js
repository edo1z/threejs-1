import * as THREE from "three";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

let ws;
let uuid;
let lastRotation = 0;
let otherPlayers = [];

document.getElementById("connect").addEventListener("click", function () {
  const name = document.getElementById("name").value;
  const connectButton = document.getElementById("connect");
  if (name) {
    connectButton.style.display = "none";
    ws = new WebSocket("ws://localhost:8080");
    uuid = generateUUID();
    localStorage.setItem("playerId", uuid);
    ws.onopen = function () {
      console.log("サーバーに接続しました");
      ws.send(JSON.stringify({ mode: "new", name: name, uuid: uuid }));
      animate();
    };

    ws.onmessage = function (event) {
      // サーバーから受け取ったユーザー配列情報
      const users = JSON.parse(event.data);

      // 他のプレイヤーの情報を更新
      users.forEach((user) => {
        // 自分自身の情報はスキップ
        if (user.uuid === uuid) return;

        // 既に存在するプレイヤーかチェック
        let otherPlayer = otherPlayers.find(
          (player) => player.uuid === user.uuid
        );

        if (otherPlayer) {
          // 既存のプレイヤーの位置を更新
          otherPlayer.mesh.position.lerp(
            new THREE.Vector3(
              user.position.x,
              user.position.y,
              user.position.z
            ),
            0.5
          );
          // プレイヤーの向きを更新
          otherPlayer.mesh.quaternion.slerp(
            new THREE.Quaternion().setFromEuler(
              new THREE.Euler(0, user.rotation, 0)
            ),
            0.5
          );
        } else {
          // 新規プレイヤーを作成
          const mesh = createPlayer(0xffcc00, 0xcc2211);
          mesh.position.set(user.position.x, user.position.y, user.position.z);
          mesh.rotation.y = user.rotation; // プレイヤーの向きを設定
          scene.add(mesh);

          // プレイヤーの名前を表示する要素を作成
          const div = document.createElement("div");
          div.className = "label";
          div.textContent = user.name;
          const label = new CSS2DObject(div);
          label.center.set(0, 0);
          label.position.y = 2;
          label.position.z = -0.5;
          label.layers.set(1);
          mesh.add(label);

          // 他のプレイヤー配列に追加
          otherPlayers.push({
            uuid: user.uuid,
            mesh: mesh,
          });
        }
      });
    };

    ws.onerror = function (error) {
      console.log(`WebSocketエラー: ${error}`);
      connectButton.style.display = "block";
    };

    ws.onclose = function () {
      console.log("サーバーから切断されました");
      connectButton.style.display = "block";
    };
  } else {
    alert("名前を入力してください");
  }
});
// UUIDを生成する関数
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
  nose.position.set(0, 0.5, -0.75);
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

// label renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.zIndex = "1";
document.body.appendChild(labelRenderer.domElement);

const player = createPlayer(0xffcc00, 0xcc2211);
scene.add(player);

// camera
camera.position.set(0, 5, 17);
camera.layers.enableAll();
player.add(camera);

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

let moveSpeed = 0.5;

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
  let changed = false;
  let position = {
    x: player.position.x,
    y: player.position.y,
    z: player.position.z,
  };

  if (keyState["w"]) {
    player.position.x -= moveSpeed * Math.sin(playerRotation);
    player.position.z -= moveSpeed * Math.cos(playerRotation);
    changed = true;
  }
  if (keyState["s"]) {
    player.position.x += moveSpeed * Math.sin(playerRotation);
    player.position.z += moveSpeed * Math.cos(playerRotation);
    changed = true;
  }
  if (keyState["a"]) {
    player.position.x -= moveSpeed * Math.cos(playerRotation);
    player.position.z += moveSpeed * Math.sin(playerRotation);
    changed = true;
  }
  if (keyState["d"]) {
    player.position.x += moveSpeed * Math.cos(playerRotation);
    player.position.z -= moveSpeed * Math.sin(playerRotation);
    changed = true;
  }

  // 移動または回転したら、WebSocketでUUIDと位置情報を送信
  if (changed || player.rotation.y !== lastRotation) {
    ws.send(
      JSON.stringify({
        mode: "move",
        uuid: uuid,
        position: position,
        rotation: playerRotation,
      })
    );
    lastRotation = player.rotation.y;
  }

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
