const WebSocket = require('ws');

function createClient(url = 'wss://127.0.0.1:8080/') {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);

    ws.on('open', () => {
      console.log('Connected to dSigner');
      resolve(ws);
    });

    ws.on('error', (err) => {
      reject(new Error('Could not connect to dSigner. Is the app open? ' + err.message));
    });
  });
}

module.exports = { createClient };