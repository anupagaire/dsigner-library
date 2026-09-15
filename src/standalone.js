import React from 'react';
import { createRoot } from 'react-dom/client';
import { DsignerWidget } from './components/DsignerWidget.jsx';
import { CoordinatePicker } from './components/CoordinatePicker.jsx';
import { PdfViewer } from './components/PdfViewer.jsx';
import { sign } from './api.js';
import { createClient, getConnection } from './client.js';
import { signPdf } from './actions/signPdf.js';
import { signForm } from './actions/signForm.js';

// ── signData (eMsigner data signing) — defined directly here, not exported by api.js ──
async function signData(options = {}) {
  const {
    signer      = 'emsigner',
    dataToSign,
    certtype    = 'ALL',
    expirycheck = false,
    issuername  = '',
    certclass   = '1|2|3',
  } = options;

  const connections = await createClient();
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

// ── mount full widget ──
function mount(selector, props = {}) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!container) {
    console.error('DsignerWidgets.mount: container not found for', selector);
    return;
  }
  const widgetRef = React.createRef();
  const root = createRoot(container);
  root.render(React.createElement(DsignerWidget, { ...props, ref: widgetRef }));

  return { root, widgetRef };
}

// ── mount coordinate picker ──
function mountCoordinatePicker(selector, props = {}) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!container) {
    console.error('DsignerWidgets.mountCoordinatePicker: container not found for', selector);
    return;
  }
  const root = createRoot(container);
  root.render(React.createElement(CoordinatePicker, props));
  return root;
}

// ── mount PDF viewer ──
function mountPdfViewer(selector, props = {}) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!container) {
    console.error('DsignerWidgets.mountPdfViewer: container not found for', selector);
    return;
  }
  const root = createRoot(container);
  root.render(React.createElement(PdfViewer, props));
  return root;
}

// ── expose on window for plain <script> usage ──
if (typeof window !== 'undefined') {
  window.DsignerWidgets = {
    mount,
    mountCoordinatePicker,
    mountPdfViewer,
    sign,
    signData,
    createClient,
    getConnection,
    signPdf,
    signForm,
  };
}

export {
  mount,
  mountCoordinatePicker,
  mountPdfViewer,
  sign,
  signData,
  createClient,
  getConnection,
  signPdf,
  signForm,
  DsignerWidget,
  CoordinatePicker,
  PdfViewer,
};