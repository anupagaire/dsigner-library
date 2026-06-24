import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { createClient } from '../client.js';
import { signPdf } from '../actions/signPdf.js';
import { signForm } from '../actions/signForm.js';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SIGNER_PORTS = { dsigner: 8080, emsigner: 1645 };

const INPUT_TYPES = [
  { id: 0, label: 'Base64',    placeholder: 'Paste base64 encoded PDF string...' },
  { id: 1, label: 'File path', placeholder: '/Users/you/Documents/file.pdf' },
  { id: 2, label: 'URL',       placeholder: 'https://example.com/file.pdf' },
  { id: 4, label: 'Protected', placeholder: 'https://example.com/secure.pdf' },
];

const STAMP_TYPES = [
  { id: 0, label: 'Base64',    placeholder: 'Paste base64 image...' },
  { id: 1, label: 'File path', placeholder: '/Users/you/stamp.png' },
  { id: 2, label: 'URL',       placeholder: 'https://example.com/stamp.png' },
];

const SIGN_PAGES = [
  { value: 'all',    label: 'All pages' },
  { value: 'first',  label: 'First page' },
  { value: 'last',   label: 'Last page' },
  { value: 'even',   label: 'Even pages' },
  { value: 'odd',    label: 'Odd pages' },
  { value: 'custom', label: 'Custom pages' },
];

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, fontSize: 12, fontWeight: 500, color: '#555' }}>
        {label}
        <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, fontWeight: 500, background: required ? '#fff0f0' : '#f5f4f0', color: required ? '#d04040' : '#aaa' }}>
          {required ? 'required' : 'optional'}
        </span>
      </div>
      {children}
    </div>
  );
}

const inp = { width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #ece9e2', fontSize: 12, color: '#1a1a1a', background: '#fafaf8', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const typeBtn = (active) => ({ padding: '5px 8px', borderRadius: 6, border: active ? '1.5px solid #1a1a1a' : '1px solid #ece9e2', background: active ? '#f5f4f0' : '#fff', color: active ? '#1a1a1a' : '#888', fontSize: 11, fontWeight: active ? 500 : 400, cursor: 'pointer', fontFamily: 'inherit' });
const sectionLabel = { fontSize: 10, fontWeight: 600, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 };

export function DsignerWidget({
  onSigned,
  defaultSigner      = 'dsigner',
  defaultInputType   = 0,
  defaultPdfInput    = '',
  defaultCoordinates = '400,100,600,200',
  defaultLocation    = '',
  defaultSignPage    = 'all',
  defaultOutputPath  = '',
  defaultFormData    = '',
  hideOutput         = false,
  height             = '100vh',
  primaryColor       = '#1a1a1a',
  pdfConfigs         = {},   // ← NEW: { 0: {pdfInput, outputPath}, 1: {...}, 2: {...} }
}) {
  const [activeTab, setActiveTab]         = useState('pdf');
  const [signer, setSigner]               = useState(defaultSigner);
  const [inputType, setInputType]         = useState(defaultInputType);
  const [stampType, setStampType]         = useState(0);
  const [showOptional, setShowOptional]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);
  const [pdfInput, setPdfInput]           = useState(defaultPdfInput);
  const [authHeader, setAuthHeader]       = useState('');
  const [signPage, setSignPage]           = useState(defaultSignPage);
  const [customPages, setCustomPages]     = useState('');
  const [coordinates, setCoordinates]     = useState(defaultCoordinates);
  const [location, setLocation]           = useState(defaultLocation);
  const [textStamp, setTextStamp]         = useState('0');
  const [stampValue, setStampValue]       = useState('');
  const [outputPath, setOutputPath]       = useState(defaultOutputPath);
  const [qrValue, setQrValue]             = useState('');
  const [qrX, setQrX]                     = useState('');
  const [qrY, setQrY]                     = useState('');
  const [watermark, setWatermark]         = useState('');
  const [lastPage, setLastPage]           = useState('0');
  const [formData, setFormData]           = useState(defaultFormData);
  const [previewSource, setPreviewSource] = useState(null);
  const [signedPreview, setSignedPreview] = useState(null);
  const [numPages, setNumPages]           = useState(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [drawing, setDrawing]             = useState(false);
  const [box, setBox]                     = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState(null);
  const [canvasSize, setCanvasSize]       = useState(null);
  const containerRef                      = useRef(null);
  const startPos                          = useRef(null);

  // ── Build preview source ──────────────────────────────────────────────────
  function buildPreview(val, type) {
    if (!val || !val.trim()) return null;
    if (type === 0) return `data:application/pdf;base64,${val.trim()}`;
    if (type === 2 || type === 4) return val.trim();
    return null;
  }

  // ── On mount — load defaults once ────────────────────────────────────────
  useEffect(() => {
    if (defaultPdfInput) {
      const src = buildPreview(defaultPdfInput, defaultInputType);
      setPreviewSource(src);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Switch input type ─────────────────────────────────────────────────────
  function handleTypeSwitch(newType) {
    setInputType(newType);
    setSignedPreview(null);
    setBox(null);

    // If pdfConfigs has data for this type — auto-fill!
    if (pdfConfigs[newType]) {
      const cfg = pdfConfigs[newType];
      const val = cfg.pdfInput || '';
      setPdfInput(val);
      setOutputPath(cfg.outputPath || outputPath);
      setPreviewSource(buildPreview(val, newType));
    } else {
      // No config for this type — clear for user to type
      setPdfInput('');
      setPreviewSource(null);
    }
  }

  // ── Page load callbacks ───────────────────────────────────────────────────
  function onPageLoadSuccess(page) {
    setPdfDimensions({ width: page.originalWidth || page.width, height: page.originalHeight || page.height });
    setTimeout(() => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) setCanvasSize({ width: canvas.offsetWidth, height: canvas.offsetHeight });
    }, 150);
  }

  function onRenderSuccess() {
    setTimeout(() => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) setCanvasSize({ width: canvas.offsetWidth, height: canvas.offsetHeight });
    }, 100);
  }

  // ── Drawing ───────────────────────────────────────────────────────────────
  function getPos(e) {
    const rect = containerRef.current.getBoundingClientRect();
    return { x: Math.max(0, e.clientX - rect.left), y: Math.max(0, e.clientY - rect.top) };
  }

  function onMouseDown(e) {
    if (signedPreview) return;
    e.preventDefault();
    setBox(null);
    setDrawing(true);
    startPos.current = getPos(e);
  }

  function onMouseMove(e) {
    if (!drawing || !startPos.current) return;
    const pos = getPos(e);
    setBox({
      x: Math.min(startPos.current.x, pos.x),
      y: Math.min(startPos.current.y, pos.y),
      w: Math.abs(pos.x - startPos.current.x),
      h: Math.abs(pos.y - startPos.current.y),
    });
  }

  function onMouseUp() {
    setDrawing(false);
    if (box && box.w > 5 && canvasSize && pdfDimensions) {
      const scaleX = pdfDimensions.width  / canvasSize.width;
      const scaleY = pdfDimensions.height / canvasSize.height;
      const x1 = Math.round(box.x * scaleX);
      const x2 = Math.round((box.x + box.w) * scaleX);
      const y1 = Math.round(pdfDimensions.height - (box.y + box.h) * scaleY);
      const y2 = Math.round(pdfDimensions.height - box.y * scaleY);
      setCoordinates(`${x1},${y1},${x2},${y2}`);
    }
  }

  // ── Build dSigner input ───────────────────────────────────────────────────
  function buildInput() {
    if (!pdfInput.trim()) return null;
    if (inputType === 4) return `{4,{"${pdfInput.trim()}",${authHeader.trim()}}}`;
    return `{${inputType},"${pdfInput.trim()}"}`;
  }

  // ── Sign PDF ──────────────────────────────────────────────────────────────
  async function handleSignPdf() {
    setLoading(true);
    setResult(null);
    setSignedPreview(null);
    try {
      const input = buildInput();
      if (!input) throw new Error('PDF input is required');
      const finalSignPage = signPage === 'custom' ? customPages.trim() : signPage;
      const ws = await createClient(`wss://127.0.0.1:${SIGNER_PORTS[signer]}/`);
      const res = await signPdf(ws, {
        input,
        signPage:    finalSignPage,
        coordinates: coordinates || '400,100,600,200',
        location:    location || 'Kathmandu',
        textStamp:   parseInt(textStamp),
        lastPage:    parseInt(lastPage),
        stamp:       textStamp === '1' && stampValue ? `{${stampType},"${stampValue}"}` : null,
        qr:          qrValue || null,
        qrX:         qrX || null,
        qrY:         qrY || null,
        watermark:   watermark || null,
        outputPath:  outputPath || null,
      });
      setTimeout(() => ws.close(), 500);

      let base64Pdf = null;
      try {
        const parsed = JSON.parse(res);
        if (parsed.message && parsed.message.startsWith('JVBER')) base64Pdf = parsed.message;
      } catch {
        if (typeof res === 'string' && res.trim().startsWith('JVBER')) base64Pdf = res.trim();
      }

      if (base64Pdf) setSignedPreview(`data:application/pdf;base64,${base64Pdf}`);
      setResult({ type: 'success', message: outputPath ? `✓ PDF signed!\nSaved to: ${outputPath}` : '✓ PDF signed successfully!' });
      if (onSigned) onSigned({ status: 'success', message: res, base64: base64Pdf });
    } catch (err) {
      setResult({ type: 'error', message: '✗ ' + err.message });
    } finally {
      setLoading(false);
    }
  }

  // ── Sign Form ─────────────────────────────────────────────────────────────
  async function handleSignForm() {
    setLoading(true);
    setResult(null);
    try {
      if (!formData.trim()) throw new Error('Form data is required');
      const ws = await createClient(`wss://127.0.0.1:${SIGNER_PORTS[signer]}/`);
      const res = await signForm(ws, { formData: formData.trim() });
      setTimeout(() => ws.close(), 500);
      setResult({ type: 'success', message: '✓ Form signed!\n\nStatus: ' + (res.status || '') });
      if (onSigned) onSigned({ status: res.status || 'success', message: res.message || res });
    } catch (err) {
      setResult({ type: 'error', message: '✗ ' + err.message });
    } finally {
      setLoading(false);
    }
  }

  const activePdf = signedPreview || previewSource;

  return (
    <div style={{ display: 'flex', height, fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f5f4f0', overflow: 'hidden' }}>

      {/* ── LEFT panel ── */}
      <div style={{ width: 320, flexShrink: 0, background: '#fff', borderRight: '1px solid #ece9e2', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ padding: '14px 16px', borderBottom: '1px solid #ece9e2', flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px' }}>dSigner</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Sign PDFs and forms via dSigner / eMsigner</div>
        </div>

        <div style={{ display: 'flex', gap: 5, padding: '10px 12px', background: '#f5f4f0', flexShrink: 0 }}>
          {['pdf', 'form'].map(tab => (
            <button key={tab}
              style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? '#1a1a1a' : '#888', fontWeight: activeTab === tab ? 500 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}
              onClick={() => { setActiveTab(tab); setResult(null); }}>
              {tab === 'pdf' ? 'Sign PDF' : 'Sign Form'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

          <div style={sectionLabel}>Signer</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
            {['dsigner', 'emsigner'].map(s => (
              <button key={s}
                style={{ padding: 8, borderRadius: 8, border: signer === s ? `2px solid ${primaryColor}` : '1px solid #ece9e2', background: signer === s ? primaryColor : '#fff', color: signer === s ? '#fff' : '#888', fontSize: 12, fontWeight: signer === s ? 500 : 400, cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => setSigner(s)}>{s}</button>
            ))}
          </div>

          {activeTab === 'pdf' && (
            <>
              <div style={sectionLabel}>Input type</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 5, marginBottom: 12 }}>
                {INPUT_TYPES.map(t => (
                  <button key={t.id} style={typeBtn(inputType === t.id)}
                    onClick={() => handleTypeSwitch(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>

              <Field label="PDF input" required>
                <textarea
                  style={{ ...inp, minHeight: 55, resize: 'vertical', fontFamily: 'monospace', fontSize: 11 }}
                  value={pdfInput}
                  onChange={e => {
                    const val = e.target.value;
                    setPdfInput(val);
                    setPreviewSource(buildPreview(val, inputType));
                    setSignedPreview(null);
                    setBox(null);
                  }}
                  placeholder={INPUT_TYPES.find(t => t.id === inputType)?.placeholder} />
              </Field>

              {inputType === 4 && (
                <Field label="Auth header" required>
                  <input style={inp} value={authHeader} onChange={e => setAuthHeader(e.target.value)}
                    placeholder='{"Authorization": "Bearer token"}' />
                </Field>
              )}

              <Field label="Sign page" required>
                <select style={inp} value={signPage} onChange={e => setSignPage(e.target.value)}>
                  {SIGN_PAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Field>

              {signPage === 'custom' && (
                <Field label="Page numbers" required>
                  <input style={inp} value={customPages} onChange={e => setCustomPages(e.target.value)} placeholder="e.g. 1,2,3" />
                </Field>
              )}

              <Field label="Coordinates" required>
                <input style={inp} value={coordinates} onChange={e => setCoordinates(e.target.value)} />
                {previewSource && inputType !== 1 && (
                  <div style={{ fontSize: 10, color: '#2563eb', marginTop: 3 }}>
                    📐 Draw a box on the PDF (right) to auto-fill
                  </div>
                )}
              </Field>

              <Field label="Location">
                <input style={inp} value={location} onChange={e => setLocation(e.target.value)} placeholder="Kathmandu" />
              </Field>

              <Field label="Stamp type" required>
                <select style={inp} value={textStamp} onChange={e => setTextStamp(e.target.value)}>
                  <option value="0">Text stamp</option>
                  <option value="1">Image stamp</option>
                </select>
              </Field>

              {textStamp === '1' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, marginBottom: 8 }}>
                    {STAMP_TYPES.map(t => (
                      <button key={t.id} style={typeBtn(stampType === t.id)} onClick={() => setStampType(t.id)}>{t.label}</button>
                    ))}
                  </div>
                  <Field label="Stamp value" required>
                    <input style={inp} value={stampValue} onChange={e => setStampValue(e.target.value)}
                      placeholder={STAMP_TYPES.find(t => t.id === stampType)?.placeholder} />
                  </Field>
                </>
              )}

              <button style={{ background: 'none', border: 'none', color: '#888', fontSize: 11, cursor: 'pointer', padding: '4px 0 8px', fontFamily: 'inherit' }}
                onClick={() => setShowOptional(v => !v)}>
                {showOptional ? '▲ Hide' : '▼ Show'} optional parameters
              </button>

              {showOptional && (
                <div style={{ borderTop: '1px solid #ece9e2', paddingTop: 12 }}>
                  {!hideOutput && (
                    <Field label="Output path">
                      <input style={inp} value={outputPath} onChange={e => setOutputPath(e.target.value)} placeholder="/Users/you/signed.pdf" />
                    </Field>
                  )}
                  <Field label="QR code">
                    <input style={inp} value={qrValue} onChange={e => setQrValue(e.target.value)} placeholder='{2,"https://example.com/qr.png"}' />
                  </Field>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <Field label="QR X"><input style={inp} value={qrX} onChange={e => setQrX(e.target.value)} placeholder="90" /></Field>
                    <Field label="QR Y"><input style={inp} value={qrY} onChange={e => setQrY(e.target.value)} placeholder="90" /></Field>
                  </div>
                  <Field label="Watermark">
                    <input style={inp} value={watermark} onChange={e => setWatermark(e.target.value)} placeholder="watermark text" />
                  </Field>
                  <Field label="Last page">
                    <select style={inp} value={lastPage} onChange={e => setLastPage(e.target.value)}>
                      <option value="0">No extra last page</option>
                      <option value="1">Add last page</option>
                    </select>
                  </Field>
                </div>
              )}
            </>
          )}

          {activeTab === 'form' && (
            <Field label="Form data" required>
              <textarea
                style={{ ...inp, minHeight: 80, resize: 'vertical', fontFamily: 'monospace', fontSize: 11 }}
                value={formData} onChange={e => setFormData(e.target.value)}
                placeholder="name='Hari'|class=8|roll=1" />
            </Field>
          )}

          {result && (
            <div style={{ marginTop: 12, padding: 10, borderRadius: 8, fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', whiteSpace: 'pre-wrap', background: result.type === 'success' ? '#f0fff4' : '#fff0f0', color: result.type === 'success' ? '#1a7a3a' : '#d04040', border: `1px solid ${result.type === 'success' ? '#b8f0cc' : '#f5c0c0'}` }}>
              {result.message}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #ece9e2', flexShrink: 0 }}>
          <button
            style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: loading ? '#888' : primaryColor, color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
            onClick={activeTab === 'pdf' ? handleSignPdf : handleSignForm}
            disabled={loading}>
            {loading ? 'Signing...' : activeTab === 'pdf' ? 'Sign PDF' : 'Sign Form'}
          </button>
        </div>
      </div>

      {/* ── RIGHT panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ padding: '11px 20px', borderBottom: '1px solid #e0ddd5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>
            {signedPreview ? '✅ Signed PDF' : previewSource ? '📄 PDF Preview — draw box to set coordinates' : '📄 PDF Preview'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {signedPreview && (
              <button style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #ece9e2', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => setSignedPreview(null)}>← Original</button>
            )}
            {numPages && numPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <button style={{ padding: '3px 8px', borderRadius: 5, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                  onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>←</button>
                <span style={{ color: '#555' }}>{currentPage} / {numPages}</span>
                <button style={{ padding: '3px 8px', borderRadius: 5, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                  onClick={() => setCurrentPage(p => Math.min(numPages, p+1))} disabled={currentPage === numPages}>→</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', background: '#f0efe9', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 24 }}>
          {!activePdf ? (
            <div style={{ textAlign: 'center', color: '#bbb', paddingTop: 80 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 14 }}>Enter a PDF input on the left to preview</div>
              <div style={{ fontSize: 12, marginTop: 6, color: '#ccc' }}>Then draw a box to set your signature position</div>
            </div>
          ) : (
            <div
              ref={containerRef}
              style={{ position: 'relative', display: 'inline-block', cursor: signedPreview ? 'default' : 'crosshair', userSelect: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
            >
<Document
  file={activePdf}
  onLoadSuccess={({ numPages }) => { setNumPages(numPages); setCurrentPage(1); }}
  style={{ display: 'block' }}
>
                <Page
                  pageNumber={currentPage}
                  width={Math.min(700, window.innerWidth - 360)}
                  onLoadSuccess={onPageLoadSuccess}
                  onRenderSuccess={onRenderSuccess}
                />
              </Document>

              {!signedPreview && box && (
                <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, border: '2px solid #e74c3c', background: 'rgba(231,76,60,0.15)', pointerEvents: 'none', boxSizing: 'border-box' }} />
              )}

              {!signedPreview && box && box.w > 5 && (
                <div style={{ position: 'absolute', left: box.x, top: box.y + box.h + 4, background: '#e74c3c', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                  {coordinates}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}