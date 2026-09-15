import { createClient, getConnection } from './client.js';

let cachedConnections = null;

async function ensureConnection(signer) {
  if (!cachedConnections) {
    cachedConnections = await createClient();
  }
  return getConnection(cachedConnections, signer);
}

// ── Headless sign function — websocket ko kaam yo function le nai garcha ──
async function sign(options = {}) {
  const {
    signer = 'dsigner',
    tbs,
    coordinate = '400,100,600,200',
    pageno = 'all',
    location = 'Kathmandu',
    outputPath = '',
    signtype = 'detached',
    certtype = 'ALL',
    expirycheck = false,
    issuername = '',
    reason = '',
  } = options;

  if (!tbs) throw new Error('tbs (PDF input) is required');

  const ws = await ensureConnection(signer);

  if (signer === 'emsigner') {
    const lines = [
      `emsigneraction=pdfsign`,
      `tbs=${tbs}`,
      `outputpath=${outputPath}`,
      `signaction=1`,
      `coordinate=${coordinate}`,
      `pageno=${pageno}`,
      `location=${location}`,
      `signtype=${signtype}`,
      `certtype=${certtype}`,
      `expirycheck=${expirycheck}`,
      `issuername=${issuername}`,
      `reason=${reason}`,
    ];
    return new Promise((resolve, reject) => {
      ws.onmessage = (e) => {
        const raw = e.data;
        if (raw.toLowerCase().includes('connection established')) return;
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      };
      ws.onerror = () => reject(new Error('eMsigner sign failed'));
      ws.send(lines.join('\n'));
    });
  }

  // dSigner ko lagi existing signPdf logic reuse garnus
  const { signPdf } = await import('./actions/signPdf.js');
  return signPdf(ws, { input: `{1,"${tbs}"}`, signPage: pageno, coordinates: coordinate, location, outputPath });
}

export { sign };