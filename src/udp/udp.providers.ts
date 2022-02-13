import { UDP_SERVER } from './udp.constants';
import { rejects } from 'assert';
import { UdpBindOptions } from './udp.types';
import { createSocket } from 'dgram';

export const createUdpProviders = (
  bindOptions: UdpBindOptions = { address: '127.0.0.1', port: 3002 },
) => [
  {
    provide: UDP_SERVER,
    useFactory: () => {
      const server = createSocket({ type: 'udp4', reuseAddr: true });
      try {
        console.log('udp config: ', bindOptions);
        return new Promise((resolve) => {
          server.bind(bindOptions.port, bindOptions.address, () =>
            resolve(server),
          );
        });
      } catch (error) {
        rejects(error);
      }
    },
  },
];
