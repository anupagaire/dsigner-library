import React, { useState, useRef } from 'react';

import { Document, Page, pdfjs } from 'react-pdf';


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * CoordinatePicker
 *
 * Props:
 *   pdfSource       {string}    base64 data URL or online URL of the PDF
 *   onSelect        {function}  called with coordinates string e.g. "100,200,300,400"
 *   onClose         {function}  called when modal is closed
 *   width           {number}    optional render width in px (default 420)
 */
export function CoordinatePicker({ pdfSource, onSelect, onClose, width = 420 }) {
  const [numPages, setNumPages]           = useState(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [drawing, setDrawing]             = useState(false);
  const [box, setBox]                     = useState(null);
  const [confirmed, setConfirmed]         = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState(null);
  const [canvasSize, setCanvasSize]       = useState(null);

  const containerRef = useRef(null);
  const startPos     = useRef(null);

  // ── Page loaded — get real PDF dimensions ─────────────────────────────────

  function onPageLoadSuccess(page) {
    setPdfDimensions({
      width:  page.originalWidth  || page.width,
      height: page.originalHeight || page.height,
    });
    measureCanvas();
  }

  function measureCanvas() {
    setTimeout(() => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) setCanvasSize({ width: canvas.offsetWidth, height: canvas.offsetHeight });
    }, 150);
  }


  function getPos(e) {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, e.clientX - rect.left),
      y: Math.max(0, e.clientY - rect.top),
    };
  }

  function onMouseDown(e) {
    e.preventDefault();
    setBox(null);
    setConfirmed(null);
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

  function onMouseUp() { setDrawing(false); }

  // ── Convert px → PDF coordinates ─────────────────────────────────────────

  function handleGetCoords() {
    if (!box || box.w < 5 || box.h < 5) { alert('Draw a box on the PDF first!'); return; }
    if (!canvasSize || !pdfDimensions)   { alert('PDF still loading, please wait.'); return; }

    const scaleX = pdfDimensions.width  / canvasSize.width;
    const scaleY = pdfDimensions.height / canvasSize.height;

    const x1 = Math.round(box.x * scaleX);
    const x2 = Math.round((box.x + box.w) * scaleX);
    const y1 = Math.round(pdfDimensions.height - (box.y + box.h) * scaleY);
    const y2 = Math.round(pdfDimensions.height - box.y * scaleY);

    setConfirmed(`${x1},${y1},${x2},${y2}`);
  }

  function handleUse() {
    if (!confirmed) return;
    onSelect(confirmed);
    onClose();
  }

  const styles = {
    overlay: {
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'system-ui, sans-serif',
    },
    modal: {
      background: '#fff', borderRadius: 14,
      width: '95%', maxWidth: 860,
      maxHeight: '92vh',
      boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 20px', borderBottom: '1px solid #ece9e2', flexShrink: 0,
    },
    body: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },
    left: {
      width: 220, flexShrink: 0, padding: '20px 16px',
      borderRight: '1px solid #ece9e2', overflowY: 'auto',
    },
    right: {
      flex: 1, overflowY: 'auto', background: '#f5f4f0',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '16px',
    },
    sectionLabel: {
      fontSize: 11, fontWeight: 600, color: '#aaa',
      letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8,
    },
    instruction: {
      padding: '10px 12px', background: '#f0f7ff',
      borderRadius: 8, fontSize: 12, color: '#2563eb', lineHeight: 1.6,
    },
    btn: {
      padding: '9px 14px', borderRadius: 8, border: 'none',
      background: '#1a1a1a', color: '#fff',
      fontSize: 13, cursor: 'pointer', width: '100%',
      fontFamily: 'inherit', marginTop: 12,
    },
    coordBox: {
      marginTop: 16, padding: 12,
      background: '#f5f4f0', borderRadius: 10,
    },
    closeBtn: {
      background: 'none', border: 'none',
      fontSize: 20, cursor: 'pointer', color: '#888',
    },
    navRow: {
      display: 'flex', alignItems: 'center',
      gap: 10, marginTop: 16,
    },
    navBtn: {
      padding: '4px 12px', borderRadius: 6,
      border: '1px solid #ddd', background: '#fff',
      fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
    },
    emptyState: {
      color: '#bbb', fontSize: 14,
      textAlign: 'center', paddingTop: 60, lineHeight: 1.8,
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        <div style={styles.header}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Pick Signature Position</span>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.body}>

          <div style={styles.left}>
            <div style={styles.sectionLabel}>How to use</div>
            <div style={styles.instruction}>
              🖱 Click and drag on the PDF to draw your signature box, then click Get Coordinates.
            </div>

            {numPages && numPages > 1 && (
              <>
                <div style={{ ...styles.sectionLabel, marginTop: 16 }}>Page</div>
                <div style={styles.navRow}>
                  <button style={styles.navBtn}
                    onClick={() => { setCurrentPage(p => Math.max(1, p-1)); setBox(null); setConfirmed(null); }}
                    disabled={currentPage === 1}>←</button>
                  <span style={{ fontSize: 13 }}>{currentPage} / {numPages}</span>
                  <button style={styles.navBtn}
                    onClick={() => { setCurrentPage(p => Math.min(numPages, p+1)); setBox(null); setConfirmed(null); }}
                    disabled={currentPage === numPages}>→</button>
                </div>
              </>
            )}

            {box && box.w > 5 && (
              <button style={styles.btn} onClick={handleGetCoords}>
                📐 Get Coordinates
              </button>
            )}
            {confirmed && (
              <div style={styles.coordBox}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Coordinates:</div>
                <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                  {confirmed}
                </div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>
                  You can adjust these manually after applying.
                </div>
                <button style={styles.btn} onClick={handleUse}>
                  ✓ Use these coordinates
                </button>
              </div>
            )}
          </div>

          <div style={styles.right}>
            {!pdfSource ? (
              <div style={styles.emptyState}>
                No PDF provided.<br />Pass a pdfSource prop to preview.
              </div>
            ) : (
              <div
                ref={containerRef}
                style={{ position: 'relative', display: 'inline-block', cursor: 'crosshair', userSelect: 'none' }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
              >
                <Document
                  file={pdfSource}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                >
                  <Page
                    pageNumber={currentPage}
                    width={width}
                    onLoadSuccess={onPageLoadSuccess}
                    onRenderSuccess={measureCanvas}
                  />
                </Document>

                {box && (
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
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}