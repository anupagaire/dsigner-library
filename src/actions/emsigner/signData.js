export function emsignerSignData(ws, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      dataToSign,        // base64 encoded data
      certtype    = 'ALL',
      expirycheck = false,
      issuername  = '',
      certclass   = '1|2|3',
    } = options;

    if (!dataToSign) return reject(new Error('dataToSign is required'));

    const lines = [
      `emsigneraction=sign`,
      `datatosign=${dataToSign}`,
      `signaction=sign`,
      `certtype=${certtype}`,
      `expirycheck=${expirycheck}`,
      `issuername=${issuername}`,
      `certclass=${certclass}`,
    ];

    ws.send(lines.join('\n'));

    ws.onmessage = (event) => {
      const raw = event.data;
      if (raw.toLowerCase().includes('connection established')) return;
      try { resolve(JSON.parse(raw)); }
      catch { resolve(raw); }
    };

    ws.onerror = () => reject(new Error('eMsigner signData failed'));
  });
}