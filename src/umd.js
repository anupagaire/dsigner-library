import React from 'react';
import ReactDOM from 'react-dom/client';
import { DsignerWidget } from './components/DsignerWidget.jsx';
import { CoordinatePicker } from './components/CoordinatePicker.jsx';
import { createClient, getConnection } from './client.js';
import { signPdf } from './actions/signPdf.js';
import { signForm } from './actions/signForm.js';
import { PdfViewer } from './components/PdfViewer.jsx';

// ── Connect once when script loads ──
let _connectionsPromise = null;

function getConnections() {
  if (!_connectionsPromise) {
    _connectionsPromise = createClient();
  }
  return _connectionsPromise;
}

// ── mount full widget ──
function mount(selector, props = {}) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector) : selector;
  if (!container) { console.error('Container not found:', selector); return; }
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(DsignerWidget, props));
  return () => root.unmount();
}

// ── mount coordinate picker ──
function mountCoordinatePicker(selector, props = {}) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector) : selector;
  if (!container) { console.error('Container not found:', selector); return; }
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(CoordinatePicker, props));
  return () => root.unmount();
}
function mountPdfViewer(selector, props = {}) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector) : selector;
  if (!container) { console.error('Container not found:', selector); return; }
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(PdfViewer, props));
  return () => root.unmount();
}
 
// ── headless sign() ──
async function sign(options = {}) {
  const {
    signer      = 'dsigner',
    tbs,
    input,
    coordinate  = '400,100,600,200',
    coordinates = '400,100,600,200',
    pageno      = 'all',
    signPage    = 'all',
    location    = 'Kathmandu',
    outputPath  = '',
    outputpath  = '',
    signtype    = 'detached',
    certtype    = 'ALL',
    expirycheck = false,
    issuername  = '',
    reason      = '',
    textStamp   = 0,
    lastPage    = 0,
    stamp       = null,
    qr          = null,
    qrX         = null,
    qrY         = null,
    watermark   = null,
  } = options;

  const connections = await getConnections(); // ← reuse existing connection!
  const ws = getConnection(connections, signer);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`${signer} did not respond within 60s`));
    }, 60000);

    if (signer === 'emsigner') {
      const lines = [
        `emsigneraction=pdfsign`,
        `tbs=${tbs || input || ''}`,
        `outputpath=${outputpath || outputPath || ''}`,
        `signaction=1`,
        `coordinate=${coordinate || coordinates}`,
        `pageno=${pageno || signPage}`,
        `location=${location}`,
        `signtype=${signtype}`,
        `certtype=${certtype}`,
        `expirycheck=${expirycheck}`,
        `issuername=${issuername}`,
        `reason=${reason}`,
      ];
      ws.send(lines.join('\n'));
    } else {
      // dSigner
      const finalInput = input || (tbs ? `{1,"${tbs}"}` : null);
      if (!finalInput) { clearTimeout(timeout); return reject(new Error('input or tbs is required')); }

      const lines = [
        `action=signPdf`,
        `input=${finalInput}`,
        `signPage=${signPage || pageno}`,
        `coordinates=${coordinates || coordinate}`,
        `location=${location}`,
        `textStamp=${textStamp}`,
        `lastPage=${lastPage}`,
      ];
      if (textStamp === 1 && stamp) lines.push(`stamp=${stamp}`);
      if (qr)        lines.push(`qr=${qr}`);
      if (qrX)       lines.push(`qrX=${qrX}`);
      if (qrY)       lines.push(`qrY=${qrY}`);
      if (watermark) lines.push(`watermark="${watermark}"`);
      if (outputPath || outputpath) lines.push(`output={"${outputPath || outputpath}"}`);
      ws.send(lines.join('\n'));
    }

    ws.onmessage = (event) => {
      const raw = event.data;
      if (!raw || raw.trim() === '') return;
      if (raw.toLowerCase().includes('connection established')) return;
      if (raw.toLowerCase().includes('version')) return;
      clearTimeout(timeout);
      try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
    };

    ws.onerror = () => { clearTimeout(timeout); reject(new Error(`${signer} signing failed`)); };
  });
}

// ── signData (eMsigner data signing) ──
async function signData(options = {}) {
  const {
    signer      = 'emsigner',
    dataToSign,
    certtype    = 'ALL',
    expirycheck = false,
    issuername  = '',
    certclass   = '1|2|3',
  } = options;

  const connections = await getConnections();
  const ws = getConnection(connections, signer);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('eMsigner did not respond within 60s')), 60000);
    const lines = [
      `emsigneraction=sign`,
      `datatosign=${dataToSign || ''}`,
      `signaction=sign`,
      `certtype=${certtype}`,
      `expirycheck=${expirycheck}`,
      `issuername=${issuername}`,
      `certclass=${certclass}`,
    ];
    ws.send(lines.join('\n'));

    ws.onmessage = (event) => {
      const raw = event.data;
      if (!raw || raw.trim() === '') return;
      if (raw.toLowerCase().includes('version')) return;
      clearTimeout(timeout);
      try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
    };

    ws.onerror = () => { clearTimeout(timeout); reject(new Error('eMsigner signData failed')); };
  });
}

export {
  mount,
  mountCoordinatePicker, mountPdfViewer,
  sign,
  signData,
  createClient,
  getConnection,
  signPdf,
  signForm,
  DsignerWidget,
  CoordinatePicker,  PdfViewer,   
};