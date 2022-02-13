import { Server, Socket } from 'net';
import { Injectable, Inject } from '@nestjs/common';
import { TCP_SERVER } from './tcp.constants';
import { PostRepository } from 'src/posts/post.repository';

@Injectable()
export class TcpService {
  constructor(
    @Inject(TCP_SERVER) private readonly tcp: Server,
    private posts: PostRepository,
  ) {
    this.tcp.on('connection', this.onConnection.bind(this));
  }

  onConnection(con: Socket) {
    console.log(`New TCP connection: ${con.remoteAddress}:${con.remotePort}`);
    con.on('data', (data) => this.onData(con, data));
  }

  onData(con: Socket, data: Buffer) {
    const cmd = data.toString('utf8').trim();
    switch (cmd) {
      case 'export':
        this.handleExport(con);
        break;
      default:
        console.error(`Unknown command: ${cmd}`);
    }
  }

  async handleExport(con: Socket) {
    const posts = await this.posts.getPosts();
    con.write(JSON.stringify(posts));
  }

  getTcpServer() {
    return this.tcp;
  }

  root(): string {
    return 'Hello from TcpService !';
  }

  close() {
    console.log('tcp.service: close()');
    this.tcp.close();
  }
}
