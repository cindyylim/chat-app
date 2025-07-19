const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 4001 });

let onlineUsers = new Set();

wss.on('connection', function connection(ws, req) {
  // Expect the client to send their userId as the first message
  ws.on('message', function incoming(message) {
    try {
      const { type, userId } = JSON.parse(message);
      if (type === 'join' && userId) {
        ws.userId = userId;
        onlineUsers.add(userId);
        broadcastPresence();
      }
    } catch (e) {}
  });

  ws.on('close', function () {
    if (ws.userId) {
      onlineUsers.delete(ws.userId);
      broadcastPresence();
    }
  });
});

function broadcastPresence() {
  const payload = JSON.stringify({
    type: 'presence',
    onlineUsers: Array.from(onlineUsers),
  });
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

console.log('Presence server running on ws://localhost:4001'); 