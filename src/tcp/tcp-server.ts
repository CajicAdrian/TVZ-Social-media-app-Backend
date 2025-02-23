import * as net from 'net';
import WebSocket, { WebSocketServer } from 'ws'; // ✅ Correct WebSocket import

// Create WebSocket server for frontend clients
const wss = new WebSocketServer({ port: 3001 }); // ✅ Fix WebSocket Server property error
const clients = new Set<WebSocket>(); // ✅ Fix TypeScript typing

wss.on('connection', (ws: WebSocket) => {
  console.log('🌐 Frontend connected via WebSocket!');
  clients.add(ws);

  ws.on('close', () => {
    console.log('❌ Frontend disconnected.');
    clients.delete(ws);
  });
});

// Create TCP server to receive notifications
const server = net.createServer((socket) => {
  console.log('📡 Klijent povezan!');

  socket.on('data', (data) => {
    const message = data.toString().trim();
    console.log(`📩 Primljen zahtjev: ${message}`);

    // Create a notification message
    const notification = { message, timestamp: new Date().toISOString() };

    // Send the notification to all connected WebSocket clients (frontend)
    clients.forEach((client) => {
      client.send(JSON.stringify(notification)); // ✅ WebSocket typing is now correct
    });

    // Respond to the TCP client
    socket.write(`OK: Notification sent for ${message}\n`);
  });

  socket.on('end', () => {
    console.log('❌ Klijent prekinuo vezu.');
  });
});

// Start the TCP server on port 4000
server.listen(4000, () => {
  console.log('🚀 TCP server pokrenut na portu 4000');
});
