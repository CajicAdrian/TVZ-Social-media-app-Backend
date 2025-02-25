import * as net from 'net';
import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });
const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
  });
});

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const message = data.toString().trim();

    const notification = { message, timestamp: new Date().toISOString() };

    clients.forEach((client) => {
      client.send(JSON.stringify(notification));
    });

    socket.write(`OK: Notification sent for ${message}\n`);
  });
});

server.listen(4000, () => {});
