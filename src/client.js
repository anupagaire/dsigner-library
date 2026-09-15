const PORT_LIST = [8080, 1645, 1812, 2083, 2948];

function identifyService(data) {
  const lower = data.toLowerCase();
  if (lower.includes('version'))               return 'emsigner';
  if (lower.includes('connection established')) return 'dsigner';
  try {
    const json = JSON.parse(data);
    if (json.status === 'connected') return 'emsigner';
  } catch {}
  return null;
}

export function createClient() {
  return new Promise((resolve, reject) => {
    const connections = {};
    let errorCount = 0;
    let resolved = false;

    PORT_LIST.forEach(port => {
      const ws = new WebSocket(`wss://127.0.0.1:${port}`);

      ws.onopen = () => console.log(`Port ${port} opened`);

      ws.onmessage = (event) => {
        const service = identifyService(event.data);
        if (service && !connections[service]) {
          connections[service] = ws;
          console.log(`✓ ${service} connected on port ${port}`);
        }

        // ✅ Wait for BOTH signers before resolving
        // But also resolve after 2 seconds if only one found
        if (!resolved && connections['dsigner'] && connections['emsigner']) {
          resolved = true;
          resolve(connections);
        }
      };

      ws.onerror = () => {
        errorCount++;
        if (errorCount === PORT_LIST.length && !resolved) {
          if (Object.keys(connections).length > 0) {
            // ✅ At least one connected — resolve with what we have
            resolved = true;
            resolve(connections);
          } else {
            reject(new Error('Could not connect to dSigner or eMsigner. Are they running?'));
          }
        }
      };
    });

    // ✅ After 3 seconds — resolve with whatever connected
    // (handles case where only one signer is installed)
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        if (Object.keys(connections).length > 0) {
          resolve(connections);
        } else {
          reject(new Error('Could not connect. Are dSigner/eMsigner running?'));
        }
      }
    }, 3000);
  });
}

export function getConnection(connections, signer = 'dsigner') {
  const ws = connections[signer];
  if (!ws) throw new Error(`${signer} is not connected. Is the app open?`);
  return ws;
}