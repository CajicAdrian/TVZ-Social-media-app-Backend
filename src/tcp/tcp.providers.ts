import { TCP_SERVER } from './tcp.constants';
import { rejects } from 'assert';
import { TcpBindOptions } from './tcp.types';
import { createServer } from 'net';

export const createTcpProviders = (
  bindOptions: TcpBindOptions = { address: '127.0.0.1', port: 3001 },
) => [
  {
    provide: TCP_SERVER,
    useFactory: () => {
      const server = createServer();
      try {
        console.log('tcp config: ', bindOptions);
        return new Promise((resolve) => {
          server.listen(bindOptions.port, bindOptions.address, () =>
            resolve(server),
          );
        });
      } catch (error) {
        rejects(error);
      }
    },
  },
];
