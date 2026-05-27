function signPdf(ws, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      input,
      signPage    = 'all',
      coordinates = '400,100,600,200',
      location    = 'Kathmandu',
      textStamp   = 0,
      lastPage    = 0,
      stamp       = null,
      qr          = null,
      qrX         = null,
      qrY         = null,
      watermark   = null,
      outputPath  = null,
    } = options;

    if (!input) return reject(new Error('input is required'));

    const lines = [
      `action=signPdf`,
      `input=${input}`,
      `signPage=${signPage}`,
      `coordinates=${coordinates}`,
      `location=${location}`,
      `textStamp=${textStamp}`,
      `lastPage=${lastPage}`,
    ];

    if (textStamp === 1 && stamp) lines.push(`stamp=${stamp}`);
    if (qr)        lines.push(`qr=${qr}`);
    if (qrX)       lines.push(`qrX=${qrX}`);
    if (qrY)       lines.push(`qrY=${qrY}`);
    if (watermark) lines.push(`watermark="${watermark}"`);
    if (outputPath) lines.push(`output={"${outputPath}"}`);

    ws.send(lines.join('\n'));

    ws.on('message', (data) => resolve(data.toString()));
    ws.on('error',   (err)  => reject(new Error('signPdf failed: ' + err.message)));
  });
}

module.exports = { signPdf };