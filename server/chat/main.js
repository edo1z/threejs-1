const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

let users = [];

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    let user;

    switch (data.mode) {
      case "new":
        user = {
          uuid: data.uuid,
          name: data.name,
          position: { x: 0, y: 0, z: 0 },
          rotation: 0,
        };
        users.push(user);
        ws.uuid = data.uuid;
        break;
      case "move":
        user = users.find((user) => user.uuid === data.uuid);
        if (user) {
          user.position = data.position;
          user.rotation = data.rotation;
        }
        break;
      case "message":
        break;
      case "name":
        user = users.find((user) => user.uuid === data.uuid);
        if (user) {
          user.name = data.name;
        }
        break;
    }
  });

  ws.on("close", () => {
    console.log("Client has disconnected");
    users = users.filter((user) => user.uuid !== ws.uuid);
  });
});

setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(users));
    }
  });
}, 100);
