const WebSocket = require("ws");
const { Chess } = require("chess.js");

const server = new WebSocket.Server({ port: 8080 });
let game = new Chess();

server.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "init", fen: game.fen() }));

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "move") {
      const move = game.move(data.move);

      if (move) {
        const response = JSON.stringify({ type: "move", move, fen: game.fen() });
        server.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(response);
          }
        });
      }
    }
  });
});

console.log("WebSocket Server running on ws://localhost:8080");
