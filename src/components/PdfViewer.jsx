import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { signPdf } from '../actions/signPdf.js';
import { emsignerSignPdf } from '../actions/emsigner/signPdf.js';
import { createClient, getConnection } from '../client.js';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MOBILE_BREAKPOINT = 640;

// ── Named position presets for popup mode (desktop only — see isMobile logic below) ──
const POSITION_PRESETS = {
  center: {
    overlay: { alignItems: 'center', justifyContent: 'center' },
    popup:   { width: '95vw', height: '92vh' },
  },
  'top-right': {
    overlay: { alignItems: 'flex-start', justifyContent: 'flex-end', background: 'transparent', pointerEvents: 'none' },
    popup:   { width: 420, height: 560, margin: 20, pointerEvents: 'auto' },
  },
  'top-left': {
    overlay: { alignItems: 'flex-start', justifyContent: 'flex-start', background: 'transparent', pointerEvents: 'none' },
    popup:   { width: 420, height: 560, margin: 20, pointerEvents: 'auto' },
  },
  'bottom-right': {
    overlay: { alignItems: 'flex-end', justifyContent: 'flex-end', background: 'transparent', pointerEvents: 'none' },
    popup:   { width: 420, height: 560, margin: 20, pointerEvents: 'auto' },
  },
  'bottom-left': {
    overlay: { alignItems: 'flex-end', justifyContent: 'flex-start', background: 'transparent', pointerEvents: 'none' },
    popup:   { width: 420, height: 560, margin: 20, pointerEvents: 'auto' },
  },
};

/**
 * PdfViewer
 *
 * Props:
 *   pdfSource            {string}    base64 data URL, https URL, or file path
 *   onCoordinateSelect   {function}  called with coords string "x1,y1,x2,y2"
 *   onClose              {function}  called when modal closed (popup mode only)
 *   inline               {boolean}   if true → renders inline, no modal wrapper (default: false)
 *   width                {number}    PDF render width in px on desktop (default: 700).
 *                                    On mobile the PDF always fits the available viewport width instead.
 *   height               {string}    viewer height (default: '100%')
 *   showCoordinatePicker {boolean}   enable drawing box for coordinates — mouse AND touch (default: true)
 *
 *   // ── Signing ──
 *   enableSigning  {boolean}   show sign button after coords picked (default: false)
 *   signer         {string}    'dsigner' | 'emsigner' (default: 'dsigner')
 *   inputType      {number}    0=base64, 1=filepath, 2=url, 4=protected (default: 0, auto-corrected if mismatched)
 *   pdfInputValue  {string}    raw value to send to the signer app. Defaults to pdfSource
 *   location       {string}    signing location (default: 'Kathmandu')
 *   outputPath     {string}    where the signer app should save the output
 *   onSigned       {function}  called with { status, raw, base64 } after sign attempt
 *
 *   // ── Popup placement (popup mode only, ignored when inline=true) ──
 *   popupPosition  {string}    'center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
 *                              (default: 'center'). On mobile screens this is ignored and the
 *                              popup always goes full-screen — corner popups aren't usable on small screens.
 *   popupStyle     {object}    inline style overrides for the popup box (desktop; ignored on mobile)
 *   overlayStyle   {object}    inline style overrides for the backdrop (desktop; ignored on mobile)
 */
export function PdfViewer({
  pdfSource,
  onCoordinateSelect,
  onClose,
  inline               = false,
  width                = 700,
  height               = '100%',
  showCoordinatePicker = true,

  // signing
  enableSigning = false,
  signer        = 'dsigner',
  inputType     = 0,
  pdfInputValue = null,
  location      = 'Kathmandu',
  outputPath    = '',
  onSigned      = null,

  // popup placement
  popupPosition = 'center',
  popupStyle    = null,
  overlayStyle  = null,
}) {
  const [numPages, setNumPages]               = useState(null);
  const [currentPage, setCurrentPage]         = useState(1);
  const [scale, setScale]                     = useState(1);
  const [drawing, setDrawing]                 = useState(false);
  const [box, setBox]                         = useState(null);
  const [confirmedCoords, setConfirmedCoords] = useState(null);
  const [pdfDimensions, setPdfDimensions]     = useState(null);
  const [canvasSize, setCanvasSize]           = useState(null);
  const [resolvedSource, setResolvedSource]   = useState(null);

  const [signing, setSigning]       = useState(false);
  const [signResult, setSignResult] = useState(null);
  const [signedPdf, setSignedPdf]   = useState(null);
  // ── Responsive tracking ────────────────────────────────────────────────────
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const isMobile = viewportWidth <= MOBILE_BREAKPOINT;

  const wrapperRef   = useRef(null); // outer scroll area we measure for auto PDF width on mobile
  const containerRef = useRef(null);
  const startPos     = useRef(null);

  useEffect(() => {
    function onResize() { setViewportWidth(window.innerWidth); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Effective render width for the PDF page: on mobile, fit the wrapper
  // (minus padding) instead of using the fixed desktop `width` prop.
  const [autoWidth, setAutoWidth] = useState(null);
  useEffect(() => {
    if (!isMobile) { setAutoWidth(null); return; }
    function measure() {
      const w = wrapperRef.current?.offsetWidth;
      if (w) setAutoWidth(Math.max(240, w - 24)); // 24 = left+right padding
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isMobile]);

  const effectiveWidth = isMobile ? (autoWidth || viewportWidth - 24) : width;

  // ── Resolve source ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pdfSource) return;

    if (pdfSource.startsWith('data:')) {
      setResolvedSource(pdfSource);
      return;
    }

    if (pdfSource.startsWith('http://') || pdfSource.startsWith('https://')) {
      setResolvedSource(pdfSource);
      return;
    }

    console.warn('PdfViewer: local file paths cannot be previewed in browser. Use base64 or URL.');
    setResolvedSource(null);
  }, [pdfSource]);

  // ── Page load ─────────────────────────────────────────────────────────────
  function onPageLoadSuccess(page) {
    setPdfDimensions({
      width:  page.originalWidth  || page.width,
      height: page.originalHeight || page.height,
    });
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

  // ── Shared position helper (mouse + touch) ───────────────────────────────
  function getPosFromClientCoords(clientX, clientY) {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, clientX - rect.left),
      y: Math.max(0, clientY - rect.top),
    };
  }

  function beginDraw(clientX, clientY) {
    if (!showCoordinatePicker) return;
    setBox(null);
    setConfirmedCoords(null);
    setSignResult(null);
    setDrawing(true);
    startPos.current = getPosFromClientCoords(clientX, clientY);
  }

  function updateDraw(clientX, clientY) {
    if (!drawing || !startPos.current) return;
    const pos = getPosFromClientCoords(clientX, clientY);
    setBox({
      x: Math.min(startPos.current.x, pos.x),
      y: Math.min(startPos.current.y, pos.y),
      w: Math.abs(pos.x - startPos.current.x),
      h: Math.abs(pos.y - startPos.current.y),
    });
  }

  function endDraw() {
    setDrawing(false);
    if (box && box.w > 5 && canvasSize && pdfDimensions) {
      const scaleX = pdfDimensions.width  / canvasSize.width;
      const scaleY = pdfDimensions.height / canvasSize.height;
      const x1 = Math.round(box.x * scaleX);
      const x2 = Math.round((box.x + box.w) * scaleX);
      const y1 = Math.round(pdfDimensions.height - (box.y + box.h) * scaleY);
      const y2 = Math.round(pdfDimensions.height - box.y * scaleY);
      const coords = `${x1},${y1},${x2},${y2}`;
      setConfirmedCoords(coords);
      if (onCoordinateSelect) onCoordinateSelect(coords);
    }
  }

  // ── Mouse handlers (desktop) ─────────────────────────────────────────────
  function onMouseDown(e) { e.preventDefault(); beginDraw(e.clientX, e.clientY); }
  function onMouseMove(e) { updateDraw(e.clientX, e.clientY); }
  function onMouseUp()    { endDraw(); }

  // ── Touch handlers (mobile) ──────────────────────────────────────────────
  // preventDefault stops the page from scrolling while the user is drawing a box.
  function onTouchStart(e) {
    if (!showCoordinatePicker) return;
    const t = e.touches[0];
    if (!t) return;
    e.preventDefault();
    beginDraw(t.clientX, t.clientY);
  }
  function onTouchMove(e) {
    if (!drawing) return;
    const t = e.touches[0];
    if (!t) return;
    e.preventDefault();
    updateDraw(t.clientX, t.clientY);
  }
  function onTouchEnd(e) {
    if (!drawing) return;
    e.preventDefault();
    endDraw();
  }

  // ── Sign the currently loaded PDF ────────────────────────────────────────
  async function handleSign() {
    if (!confirmedCoords) {
      setSignResult({ type: 'error', message: 'Draw a box first to set coordinates.' });
      return;
    }

    setSigning(true);
    setSignResult(null);

    try {
      const connections = await createClient();
      const ws = getConnection(connections, signer);

      let value = pdfInputValue;
      if (!value) {
        value = pdfSource?.startsWith('data:')
          ? pdfSource.split(',')[1]
          : pdfSource;
      }

      // Auto-detect the correct dSigner inputType from the value itself,
      // instead of trusting a possibly-stale inputType prop.
      let effectiveInputType = inputType;
      if (value?.startsWith('http://') || value?.startsWith('https://')) {
        effectiveInputType = 2;
      } else if (value?.startsWith('/') || /^[a-zA-Z]:\\/.test(value || '')) {
        effectiveInputType = 1;
      } else if (inputType !== 4) {
        effectiveInputType = 0;
      }

      let res;

      if (signer === 'emsigner') {
        res = await emsignerSignPdf(ws, {
          tbs:        value,
          outputPath: outputPath || '',
          coordinate: confirmedCoords,
          pageno:     'all',
          location,
        });

        if (!res || (typeof res === 'string' && res.trim() === '')) {
          throw new Error('eMsigner returned an empty response — is the eMsigner app running?');
        }
      } else {
        const input = effectiveInputType === 4
          ? `{4,{"${value}",""}}`
          : `{${effectiveInputType},"${value}"}`;

        res = await signPdf(ws, {
          input,
          signPage:    'all',
          coordinates: confirmedCoords,
          location,
          textStamp:   0,
          lastPage:    0,
          outputPath:  outputPath || null,
        });
      }

      let base64Pdf = null;
      try {
        const parsed = typeof res === 'string' ? JSON.parse(res) : res;
        if (parsed?.message?.startsWith('JVBER')) base64Pdf = parsed.message;
      } catch {
        if (typeof res === 'string' && res.trim().startsWith('JVBER')) base64Pdf = res.trim();
      }
      if (base64Pdf) setSignedPdf(`data:application/pdf;base64,${base64Pdf}`);

      setSignResult({ type: 'success', message: outputPath ? `✓ Signed! Saved to: ${outputPath}` : '✓ Signed successfully!' });
      if (onSigned) onSigned({ status: 'success', raw: res, base64: base64Pdf });

    } catch (err) {
      setSignResult({ type: 'error', message: '✗ ' + err.message });
      if (onSigned) onSigned({ status: 'error', error: err.message });
    } finally {
      setSigning(false);
    }
  }

  // ── Render content ────────────────────────────────────────────────────────
  const renderContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f0efe9' }}>

      {/* Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '8px 10px' : '10px 16px',
        background: '#fff',
        borderBottom: '1px solid #e0ddd5',
        flexShrink: 0,
        gap: isMobile ? 6 : 12,
        rowGap: isMobile ? 8 : 12,
      }}>

        {/* Left — page nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8, fontSize: isMobile ? 12 : 13, order: 1 }}>
          <button style={navBtn(isMobile)} onClick={() => { setCurrentPage(p => Math.max(1, p-1)); setBox(null); }} disabled={currentPage === 1}>←</button>
          <span style={{ color: '#555', minWidth: isMobile ? 44 : 60, textAlign: 'center' }}>
            {numPages ? `${currentPage}/${numPages}` : '...'}
          </span>
          <button style={navBtn(isMobile)} onClick={() => { setCurrentPage(p => Math.min(numPages || 1, p+1)); setBox(null); }} disabled={currentPage === numPages}>→</button>
        </div>

        {/* Center — zoom */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 4 : 8,
          order: isMobile ? 3 : 2,
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'center' : 'flex-start',
        }}>
          <button style={navBtn(isMobile)} onClick={() => setScale(s => Math.max(0.5, +(s - 0.25).toFixed(2)))}>−</button>
          <span style={{ fontSize: isMobile ? 12 : 13, color: '#555', minWidth: isMobile ? 38 : 45, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button style={navBtn(isMobile)} onClick={() => setScale(s => Math.min(3, +(s + 0.25).toFixed(2)))}>+</button>
          {!isMobile && (
            <button style={{ ...navBtn(isMobile), fontSize: 11 }} onClick={() => setScale(1)}>Reset</button>
          )}
        </div>

        {/* Right — coordinate info + sign + close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, order: isMobile ? 2 : 3, flexWrap: 'wrap' }}>
          {showCoordinatePicker && !confirmedCoords && !isMobile && (
            <span style={{ fontSize: 11, color: '#2563eb' }}>
              📐 Draw box to pick coordinates
            </span>
          )}
          {showCoordinatePicker && !confirmedCoords && isMobile && (
            <span style={{ fontSize: 10, color: '#2563eb' }}>📐 Drag to pick</span>
          )}
          {confirmedCoords && (
            <span style={{
              fontSize: isMobile ? 10 : 11,
              fontFamily: 'monospace',
              background: '#f0fff4',
              color: '#1a7a3a',
              padding: isMobile ? '2px 6px' : '3px 8px',
              borderRadius: 5,
              whiteSpace: 'nowrap',
            }}>
              {confirmedCoords}
            </span>
          )}
          {enableSigning && confirmedCoords && (
            <button
              style={{ ...navBtn(isMobile), background: signing ? '#888' : '#1a1a1a', color: '#fff', border: 'none', cursor: signing ? 'not-allowed' : 'pointer' }}
              onClick={handleSign}
              disabled={signing}
            >
              {signing ? 'Signing...' : '✍️ Sign'}
            </button>
          )}
          {!inline && onClose && (
            <button style={{ ...navBtn(isMobile), padding: isMobile ? '5px 8px' : '4px 10px' }} onClick={onClose}>✕</button>
          )}
        </div>
      </div>

      {/* Sign result banner */}
      {signResult && (
        <div style={{
          padding: isMobile ? '6px 10px' : '6px 16px',
          fontSize: isMobile ? 10 : 11,
          fontFamily: 'monospace',
          background: signResult.type === 'success' ? '#f0fff4' : '#fff0f0',
          color: signResult.type === 'success' ? '#1a7a3a' : '#d04040',
          borderBottom: '1px solid #e0ddd5',
          flexShrink: 0,
          wordBreak: 'break-word',
        }}>
          {signResult.message}
        </div>
      )}

      {/* PDF area */}
      <div
        ref={wrapperRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: isMobile ? 12 : 24,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {!resolvedSource ? (
          <div style={{ textAlign: 'center', color: '#bbb', paddingTop: isMobile ? 40 : 80 }}>
            <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 12 }}>📄</div>
            {pdfSource ? (
              <>
                <div style={{ fontSize: isMobile ? 13 : 14, padding: '0 16px' }}>Local file paths cannot be previewed in browser</div>
                <div style={{ fontSize: isMobile ? 11 : 12, marginTop: 6, color: '#ccc' }}>Use base64 or a URL instead</div>
              </>
            ) : (
              <div style={{ fontSize: isMobile ? 13 : 14 }}>No PDF provided</div>
            )}
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              display: 'inline-block',
              cursor: showCoordinatePicker ? 'crosshair' : 'default',
              userSelect: 'none',
              touchAction: showCoordinatePicker ? 'none' : 'auto', // 'none' lets us drive drawing ourselves instead of the browser scrolling
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={() => drawing && endDraw()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
          >
            <Document
              file={signedPdf || resolvedSource}
              onLoadSuccess={({ numPages }) => { setNumPages(numPages); setCurrentPage(1); }}
              style={{ display: 'block' }}
            >
              <Page
                pageNumber={currentPage}
             width={effectiveWidth} 
                onLoadSuccess={onPageLoadSuccess}
                onRenderSuccess={onRenderSuccess}
              />
            </Document>

            {/* Box overlay */}
            {box && !signedPdf && (
              <div style={{
                position: 'absolute',
                left: box.x, top: box.y,
                width: box.w, height: box.h,
                border: '2px solid #e74c3c',
                background: 'rgba(231,76,60,0.15)',
                pointerEvents: 'none',
                boxSizing: 'border-box',
              }} />
            )}

            {/* Coordinates badge */}
            {confirmedCoords && box && !signedPdf && (
              <div style={{
                position: 'absolute',
                left: box.x,
                top: box.y + box.h + 4,
                background: '#e74c3c',
                color: '#fff',
                fontSize: isMobile ? 9 : 10,
                padding: '2px 6px',
                borderRadius: 4,
                fontFamily: 'monospace',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}>
                {confirmedCoords}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

 
if (inline) {
  return (
    <div style={{
      width: '100%',
      height: height,          // ← developer controls height
      overflow: 'hidden',
      borderRadius: 10,
      border: '1px solid #ece9e2',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {renderContent()}
    </div>
  );
}


  const preset = isMobile
    ? POSITION_PRESETS.center
    : (POSITION_PRESETS[popupPosition] || POSITION_PRESETS.center);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      ...preset.overlay,
      ...(isMobile ? null : overlayStyle),
    }}>
      <div style={{
        width: isMobile ? '100vw' : '95vw',
        height: isMobile ? '100vh' : '92vh',
        background: '#fff',
        borderRadius: isMobile ? 0 : 14,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        ...preset.popup,
        ...(isMobile ? { width: '100vw', height: '100vh', margin: 0, borderRadius: 0 } : popupStyle),
      }}>
        {renderContent()}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const navBtn = (isMobile) => ({
  padding: isMobile ? '6px 9px' : '5px 10px',
  borderRadius: 6,
  border: '1px solid #ddd',
  background: '#fff',
  fontSize: isMobile ? 12 : 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
  minHeight: isMobile ? 32 : 'auto', // touch target size
});