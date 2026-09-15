export function emsignerSignPdf(ws, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      tbs,              // file path or base64
      outputPath,
      coordinate  = '400,100,600,200',
      pageno      = 'all',
      location    = 'Kathmandu',
      signtype    = 'detached',
      certtype    = 'ALL',
      expirycheck = false,
      issuername  = '',
      reason      = '',
    } = options;

    if (!tbs) return reject(new Error('tbs (input) is required'));

    const lines = [
      `emsigneraction=pdfsign`,
      `tbs=${tbs}`,
      `outputpath=${outputPath || ''}`,
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

     const timeout = setTimeout(() => {
      reject(new Error('eMsigner did not respond within 60s'));
    }, 60000);

    ws.send(lines.join('\n'));

    ws.onmessage = (event) => {
      const raw = event.data;
      if (!raw || raw.trim() === '') return;
      if (raw.toLowerCase().includes('connection established')) return;
      if (raw.toLowerCase().includes('version')) return;
      clearTimeout(timeout);
      try { resolve(JSON.parse(raw)); }
      catch { resolve(raw); }
    };
 
    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('eMsigner signPdf failed'));
    };
  });
}