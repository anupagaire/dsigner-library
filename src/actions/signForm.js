export function signForm(ws, options = {}) {
  return new Promise((resolve, reject) => {
    const { formData } = options;

    if (!formData) return reject(new Error('formData is required'));

    const message = `action=signForm\ninput={3,"${formData}"}`;

    ws.send(message);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // ✅ Skip connection messages — wait for real result
        if (data.status === 'connected' || data.message === 'Connection established') {
          return; // ignore this message, wait for next one
        }

        resolve(data);
      } catch {
        // Not JSON — check if it's a connection message
        const raw = event.data;
        if (raw.toLowerCase().includes('connection established')) {
          return; // ignore, wait for next message
        }
        resolve(raw);
      }
    };

    ws.onerror = () => reject(new Error('signForm failed'));
  });
}