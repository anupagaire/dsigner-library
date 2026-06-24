
export function createClient(url = 'wss://127.0.0.1:8080/') {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
          console.log('Connected to dSigner');
          resolve(ws);
        };
    
        ws.onerror = () => {
          reject(new Error('Could not connect to dSigner. Is the app open?'));
        };
      });
    }