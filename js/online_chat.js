import * as THREE from "three";

let ws;
let uuid;
let lastRotation = 0;

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

    // 他のプレイヤーを保持する配列
    let otherPlayers = [];

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
          otherPlayer.mesh.position.set(
            user.position.x,
            user.position.y,
            user.position.z
          );
          otherPlayer.mesh.rotation.y = user.rotation; // プレイヤーの向きを更新
        } else {
          // 新規プレイヤーを作成
          const mesh = createPlayer(0xffcc00, 0xcc2211);
          mesh.position.set(user.position.x, user.position.y, user.position.z);
          mesh.rotation.y = user.rotation; // プレイヤーの向きを設定
          scene.add(mesh);

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

const player = createPlayer(0xffcc00, 0xcc2211);
scene.add(player);

// camera
camera.position.set(0, 5, 17);
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
    ws.send(JSON.stringify({ mode: "move", uuid: uuid, position: position, rotation: playerRotation }));
    lastRotation = player.rotation.y;
  }

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
