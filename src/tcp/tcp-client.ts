import * as net from 'net';

const client = net.createConnection({ port: 4000 }, () => {
  const request = 'CREATE_NOTIFICATION userId=1 action=LIKE postId=1';
  client.write(request + '\n');
});

client.on('data', (data) => {
  client.end();
});
