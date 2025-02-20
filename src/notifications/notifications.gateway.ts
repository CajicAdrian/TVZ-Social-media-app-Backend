import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as dgram from 'dgram';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST'],
  },
  namespace: 'notifications', // ✅ Ensures WebSockets use a dedicated namespace
})
export class NotificationsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private udpServer = dgram.createSocket('udp4');

  afterInit() {
    console.log('✅ WebSocket Gateway Initialized');
    this.startUDPListener();
  }

  private startUDPListener() {
    this.udpServer.on('message', (msg) => {
      try {
        const notification = JSON.parse(msg.toString());
        console.log(`🔔 UDP Notification Received:`, notification);

        // ✅ Forward the notification to all WebSocket clients
        this.server.emit('newNotification', notification);
      } catch (error) {
        console.error('❌ Error parsing UDP message:', error);
      }
    });

    this.udpServer.bind(41234, '127.0.0.1', () => {
      console.log('✅ UDP Server Listening on Port 41234');
    });
  }
}
