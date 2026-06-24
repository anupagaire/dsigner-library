# dsigner-library

A simple JavaScript library to sign PDFs and Forms using the **dSigner** desktop application via WebSocket.

---
// Users add this in their App.js or index.js
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
## Requirements

- [dSigner](https://www.dsigner.com) desktop app must be installed and running on your machine
- Node.js 14 or higher

---

## Installation

```bash
npm install dsigner-library
```

---

## Quick Start

```js
const { createClient, signPdf, signForm } = require('dsigner-library');

async function main() {
  // Connect to dSigner (must be open!)
  const ws = await createClient();

  // Sign a PDF
  const result = await signPdf(ws, {
    input: '{0,"JVBERi0x...."}',   // base64 PDF
    outputPath: '/Users/you/signed.pdf'
  });

  console.log('PDF signed!', result);

  ws.close();
}

main();
```

---

## API

### `createClient(url?)`

Connects to the dSigner desktop app via WebSocket.

| Parameter | Type | Default | Description |
|---|---|---|---|
| url | string | `wss://127.0.0.1:8080/` | dSigner WebSocket URL |

```js
const ws = await createClient();
// or custom URL:
const ws = await createClient('wss://127.0.0.1:9090/');
```

---

### `signPdf(ws, options)`

Signs a PDF file.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| input | string | ✅ Yes | — | PDF input (see input types below) |
| signPage | string | No | `'all'` | Which pages to sign |
| coordinates | string | No | `'400,100,600,200'` | Signature position |
| location | string | No | `'Kathmandu'` | Signing location |
| textStamp | number | No | `0` | `0` = text, `1` = image stamp |
| stamp | string | No | null | Stamp image (required if textStamp=1) |
| qr | string | No | null | QR code to add |
| qrX | number | No | null | QR X position |
| qrY | number | No | null | QR Y position |
| watermark | string | No | null | Watermark text |
| outputPath | string | No | null | Save signed PDF to this path |
| lastPage | number | No | `0` | `1` = add last page |

#### Input types

```js
// Base64 PDF
input: '{0,"JVBERi0x...."}'

// Offline file path
input: '{1,"C:/Documents/file.pdf"}'

// Online URL
input: '{2,"https://example.com/file.pdf"}'

// Password protected PDF
input: '{4,{"https://example.com/secure.pdf",{"Authorization":"Bearer token"}}}'
```

#### signPage options

```js
signPage: 'all'       // all pages
signPage: 'first'     // first page only
signPage: 'last'      // last page only
signPage: 'even'      // even pages
signPage: 'odd'       // odd pages
signPage: '1'         // specific page
signPage: '1,2,3'     // multiple pages
```

#### Examples

```js
// Simple sign
await signPdf(ws, {
  input: '{2,"https://example.com/file.pdf"}',
  outputPath: '/Users/you/signed.pdf'
});

// Sign with image stamp
await signPdf(ws, {
  input: '{2,"https://example.com/file.pdf"}',
  textStamp: 1,
  stamp: '{1,"C:/assets/stamp.png"}',
  outputPath: '/Users/you/signed.pdf'
});

// Sign with QR code
await signPdf(ws, {
  input: '{2,"https://example.com/file.pdf"}',
  textStamp: 1,
  stamp: '{2,"https://example.com/stamp.png"}',
  qr: '{2,"https://example.com/qr.png"}',
  qrX: 90,
  qrY: 90,
  outputPath: '/Users/you/signed.pdf'
});

// Sign with watermark
await signPdf(ws, {
  input: '{2,"https://example.com/file.pdf"}',
  qr: '{3,"{user=\'test\', serial=\'abc123\'}"}',
  qrX: 90,
  qrY: 90,
  watermark: 'mysecretwatermark',
  outputPath: '/Users/you/signed.pdf'
});

// Sign protected PDF
await signPdf(ws, {
  input: '{4,{"https://example.com/secure.pdf",{"Authorization":"Bearer mytoken"}}}',
  outputPath: '/Users/you/signed.pdf'
});
```

---

### `signForm(ws, options)`

Signs a form with key-value data. Returns a digital signature string.

| Parameter | Type | Required | Description |
|---|---|---|---|
| formData | string | ✅ Yes | Form fields as key=value pairs separated by `\|` |

```js
const result = await signForm(ws, {
  formData: "name='Hari'|class=8|roll=1"
});

console.log(result.status);   // "success"
console.log(result.message);  // signed data string (MII...)
```

---

## Full Example with Express Server

```js
const express = require('express');
const { createClient, signPdf, signForm } = require('dsigner-library');

const app = express();
app.use(express.json());

// Sign PDF endpoint
app.post('/api/sign-pdf', async (req, res) => {
  try {
    const ws = await createClient();
    const result = await signPdf(ws, req.body);
    ws.close();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sign Form endpoint
app.post('/api/sign-form', async (req, res) => {
  try {
    const ws = await createClient();
    const result = await signForm(ws, req.body);
    ws.close();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## Error Handling

```js
try {
  const ws = await createClient();
  const result = await signPdf(ws, { input: '{0,"..."}' });
  console.log(result);
} catch (err) {
  if (err.message.includes('Could not connect')) {
    console.error('dSigner is not running. Please open the dSigner app.');
  } else {
    console.error('Signing failed:', err.message);
  }
}
```

---

## License

MIT