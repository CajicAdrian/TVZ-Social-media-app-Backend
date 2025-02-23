import * as net from 'net';

const client = net.createConnection({ port: 4000 }, () => {
  console.log('🔗 Povezano s poslužiteljem!');

  // Slanje zahtjeva za notifikaciju
  const request = 'CREATE_NOTIFICATION userId=1 action=LIKE postId=1';
  console.log(`📤 Slanje zahtjeva: ${request}`);
  client.write(request + '\n'); // ✅ Šaljemo zahtjev serveru
});

client.on('data', (data) => {
  console.log(`✅ Odgovor poslužitelja: ${data.toString().trim()}`);
  client.end(); // ✅ Zatvaranje veze nakon odgovora
});

client.on('end', () => {
  console.log('🔌 Veza zatvorena.');
});
