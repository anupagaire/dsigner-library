function signForm(ws, options = {}) {
  return new Promise((resolve, reject) => {

    const { formData } = options;

    // Validate
    if (!formData) return reject(new Error('formData is required'));

    const message = [
      `action=signForm`,
      `input={3,"${formData}"}`
    ].join('\n');

    ws.send(message);

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        resolve(response); 
      } catch {
        resolve(event.data);
      }
    };

    ws.onerror = (err) => reject(new Error('signForm failed: ' + err.message));
  });
}

module.exports = { signForm };