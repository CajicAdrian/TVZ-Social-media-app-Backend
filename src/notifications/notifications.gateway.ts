import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { createSocket } from 'dgram';
import { NotificationsService } from './notifications.service';
import { Notification } from './notifications.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // ✅ Allow all origins for testing (change this in production)
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  private server: Server;

  private udpServer = createSocket('udp4'); // ✅ Create a UDP server

  constructor(private readonly notificationsService: NotificationsService) {
    this.setupUdpListener(); // ✅ Start UDP listener
  }

  // ✅ Setup UDP Server to Listen for Incoming Notifications
  private setupUdpListener(): void {
    const UDP_PORT = 41234; // ✅ Define UDP port (use any open port)

    this.udpServer.on('message', async (msg, rinfo) => {
      console.log(
        `📩 Received UDP message: ${msg.toString()} from ${rinfo.address}:${
          rinfo.port
        }`,
      );

      try {
        const notificationData = JSON.parse(msg.toString()); // ✅ Convert message to JSON

        const notification = await this.notificationsService.createNotification(
          notificationData.type,
          notificationData.user,
          notificationData.fromUser,
          notificationData.post,
          notificationData.comment,
        );

        if (notification) {
          console.log(`📢 Broadcasting notification to clients:`, notification);
          this.server.emit('newNotification', notification); // ✅ Send WebSocket event
        }
      } catch (error) {
        console.error(`❌ Failed to process UDP notification:`, error);
      }
    });

    this.udpServer.bind(UDP_PORT, () => {
      console.log(`🚀 UDP Server listening on port ${UDP_PORT}`);
    });
  }

  // ✅ WebSocket Event: Listen for Client Requesting Notifications
  @SubscribeMessage('requestNotifications')
  async handleRequestNotifications(
    @MessageBody() userId: number,
  ): Promise<void> {
    const notifications = await this.notificationsService.getNotificationsForUser(
      { id: userId } as any,
    );
    this.server.emit(`notificationsForUser:${userId}`, notifications);
  }
}
