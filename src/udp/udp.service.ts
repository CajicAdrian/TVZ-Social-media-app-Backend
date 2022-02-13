import { Injectable, Inject } from '@nestjs/common';
import { UDP_SERVER } from './udp.constants';
import { PostRepository } from 'src/posts/post.repository';
import { RemoteInfo, Socket } from 'dgram';

@Injectable()
export class UdpService {
  constructor(
    @Inject(UDP_SERVER) private readonly udp: Socket,
    private posts: PostRepository,
  ) {
    this.udp.on('message', this.onData.bind(this));
  }

  onData(data: Buffer, remote: RemoteInfo) {
    const cmd = data.toString('utf8').trim();
    switch (cmd) {
      case 'export':
        this.handleExport(remote);
        break;
      default:
        console.error(`Unknown command: ${cmd}`);
    }
  }

  async handleExport(con: RemoteInfo) {
    const posts = await this.posts.getPosts();
    this.udp.send(JSON.stringify(posts), con.port, con.address);
  }

  getUdpServer() {
    return this.udp;
  }

  root(): string {
    return 'Hello from UdpService !';
  }

  close() {
    console.log('udp.service: close()');
    this.udp.close();
  }
}
