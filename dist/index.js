import React, { useState, useRef, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

function signPdf(ws) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new Promise(function (resolve, reject) {
    var input = options.input,
      _options$signPage = options.signPage,
      signPage = _options$signPage === void 0 ? 'all' : _options$signPage,
      _options$coordinates = options.coordinates,
      coordinates = _options$coordinates === void 0 ? '400,100,600,200' : _options$coordinates,
      _options$location = options.location,
      location = _options$location === void 0 ? 'Kathmandu' : _options$location,
      _options$textStamp = options.textStamp,
      textStamp = _options$textStamp === void 0 ? 0 : _options$textStamp,
      _options$lastPage = options.lastPage,
      lastPage = _options$lastPage === void 0 ? 0 : _options$lastPage,
      _options$stamp = options.stamp,
      stamp = _options$stamp === void 0 ? null : _options$stamp,
      _options$qr = options.qr,
      qr = _options$qr === void 0 ? null : _options$qr,
      _options$qrX = options.qrX,
      qrX = _options$qrX === void 0 ? null : _options$qrX,
      _options$qrY = options.qrY,
      qrY = _options$qrY === void 0 ? null : _options$qrY,
      _options$watermark = options.watermark,
      watermark = _options$watermark === void 0 ? null : _options$watermark,
      _options$outputPath = options.outputPath,
      outputPath = _options$outputPath === void 0 ? null : _options$outputPath;
    if (!input) return reject(new Error('input is required'));
    var lines = ["action=signPdf", "input=".concat(input), "signPage=".concat(signPage), "coordinates=".concat(coordinates), "location=".concat(location), "textStamp=".concat(textStamp), "lastPage=".concat(lastPage)];
    if (textStamp === 1 && stamp) lines.push("stamp=".concat(stamp));
    if (qr) lines.push("qr=".concat(qr));
    if (qrX) lines.push("qrX=".concat(qrX));
    if (qrY) lines.push("qrY=".concat(qrY));
    if (watermark) lines.push("watermark=\"".concat(watermark, "\""));
    if (outputPath) lines.push("output={\"".concat(outputPath, "\"}"));
    ws.send(lines.join('\n'));
    ws.onmessage = function (event) {
      var raw = event.data;
      if (raw.toLowerCase().includes('connection established')) {
        return;
      }
      resolve(raw);
    };
    ws.onerror = function (err) {
      return reject(new Error('signPdf failed'));
    };
  });
}

var signPdf$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  signPdf: signPdf
});

function signForm(ws) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new Promise(function (resolve, reject) {
    var formData = options.formData;
    if (!formData) return reject(new Error('formData is required'));
    var message = "action=signForm\ninput={3,\"".concat(formData, "\"}");
    ws.send(message);
    ws.onmessage = function (event) {
      try {
        var data = JSON.parse(event.data);
        if (data.status === 'connected' || data.message === 'Connection established') {
          return; // ignore this message, wait for next one
        }
        resolve(data);
      } catch (_unused) {
        // Not JSON — check if it's a connection message
        var raw = event.data;
        if (raw.toLowerCase().includes('connection established')) {
          return;
        }
        resolve(raw);
      }
    };
    ws.onerror = function () {
      return reject(new Error('signForm failed'));
    };
  });
}

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = true,
      o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = true, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _regenerator() {
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
  var e,
    t,
    r = "function" == typeof Symbol ? Symbol : {},
    n = r.iterator || "@@iterator",
    o = r.toStringTag || "@@toStringTag";
  function i(r, n, o, i) {
    var c = n && n.prototype instanceof Generator ? n : Generator,
      u = Object.create(c.prototype);
    return _regeneratorDefine(u, "_invoke", function (r, n, o) {
      var i,
        c,
        u,
        f = 0,
        p = o || [],
        y = false,
        G = {
          p: 0,
          n: 0,
          v: e,
          a: d,
          f: d.bind(e, 4),
          d: function (t, r) {
            return i = t, c = 0, u = e, G.n = r, a;
          }
        };
      function d(r, n) {
        for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
          var o,
            i = p[t],
            d = G.p,
            l = i[2];
          r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
        }
        if (o || r > 1) return a;
        throw y = true, n;
      }
      return function (o, p, l) {
        if (f > 1) throw TypeError("Generator is already running");
        for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
          i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
          try {
            if (f = 2, i) {
              if (c || (o = "next"), t = i[o]) {
                if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                if (!t.done) return t;
                u = t.value, c < 2 && (c = 0);
              } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
              i = e;
            } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
          } catch (t) {
            i = e, c = 1, u = t;
          } finally {
            f = 1;
          }
        }
        return {
          value: t,
          done: y
        };
      };
    }(r, o, i), true), u;
  }
  var a = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  t = Object.getPrototypeOf;
  var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function () {
      return this;
    }), t),
    u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
  function f(e) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function () {
    return this;
  }), _regeneratorDefine(u, "toString", function () {
    return "[object Generator]";
  }), (_regenerator = function () {
    return {
      w: i,
      m: f
    };
  })();
}
function _regeneratorDefine(e, r, n, t) {
  var i = Object.defineProperty;
  try {
    i({}, "", {});
  } catch (e) {
    i = 0;
  }
  _regeneratorDefine = function (e, r, n, t) {
    function o(r, n) {
      _regeneratorDefine(e, r, function (e) {
        return this._invoke(r, n, e);
      });
    }
    r ? i ? i(e, r, {
      value: n,
      enumerable: !t,
      configurable: !t,
      writable: !t
    }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
  }, _regeneratorDefine(e, r, n, t);
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

pdfjs.GlobalWorkerOptions.workerSrc = "//unpkg.com/pdfjs-dist@".concat(pdfjs.version, "/build/pdf.worker.min.mjs");

/**
 * CoordinatePicker
 *
 * Props:
 *   pdfSource       {string}    base64 data URL or online URL of the PDF
 *   onSelect        {function}  called with coordinates string e.g. "100,200,300,400"
 *   onClose         {function}  called when modal is closed
 *   width           {number}    optional render width in px (default 420)
 */
function CoordinatePicker(_ref) {
  var pdfSource = _ref.pdfSource,
    onSelect = _ref.onSelect,
    onClose = _ref.onClose,
    _ref$width = _ref.width,
    width = _ref$width === void 0 ? 420 : _ref$width;
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    numPages = _useState2[0],
    setNumPages = _useState2[1];
  var _useState3 = useState(1),
    _useState4 = _slicedToArray(_useState3, 2),
    currentPage = _useState4[0],
    setCurrentPage = _useState4[1];
  var _useState5 = useState(false),
    _useState6 = _slicedToArray(_useState5, 2),
    drawing = _useState6[0],
    setDrawing = _useState6[1];
  var _useState7 = useState(null),
    _useState8 = _slicedToArray(_useState7, 2),
    box = _useState8[0],
    setBox = _useState8[1];
  var _useState9 = useState(null),
    _useState0 = _slicedToArray(_useState9, 2),
    confirmed = _useState0[0],
    setConfirmed = _useState0[1];
  var _useState1 = useState(null),
    _useState10 = _slicedToArray(_useState1, 2),
    pdfDimensions = _useState10[0],
    setPdfDimensions = _useState10[1];
  var _useState11 = useState(null),
    _useState12 = _slicedToArray(_useState11, 2),
    canvasSize = _useState12[0],
    setCanvasSize = _useState12[1];
  var containerRef = useRef(null);
  var startPos = useRef(null);
  function onPageLoadSuccess(page) {
    setPdfDimensions({
      width: page.originalWidth || page.width,
      height: page.originalHeight || page.height
    });
    measureCanvas();
  }
  function measureCanvas() {
    setTimeout(function () {
      var _containerRef$current;
      var canvas = (_containerRef$current = containerRef.current) === null || _containerRef$current === void 0 ? void 0 : _containerRef$current.querySelector('canvas');
      if (canvas) setCanvasSize({
        width: canvas.offsetWidth,
        height: canvas.offsetHeight
      });
    }, 150);
  }
  function getPos(e) {
    var rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, e.clientX - rect.left),
      y: Math.max(0, e.clientY - rect.top)
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
    var pos = getPos(e);
    setBox({
      x: Math.min(startPos.current.x, pos.x),
      y: Math.min(startPos.current.y, pos.y),
      w: Math.abs(pos.x - startPos.current.x),
      h: Math.abs(pos.y - startPos.current.y)
    });
  }
  function onMouseUp() {
    setDrawing(false);
  }
  function handleGetCoords() {
    if (!box || box.w < 5 || box.h < 5) {
      alert('Draw a box on the PDF first!');
      return;
    }
    if (!canvasSize || !pdfDimensions) {
      alert('PDF still loading, please wait.');
      return;
    }
    var scaleX = pdfDimensions.width / canvasSize.width;
    var scaleY = pdfDimensions.height / canvasSize.height;
    var x1 = Math.round(box.x * scaleX);
    var x2 = Math.round((box.x + box.w) * scaleX);
    var y1 = Math.round(pdfDimensions.height - (box.y + box.h) * scaleY);
    var y2 = Math.round(pdfDimensions.height - box.y * scaleY);
    setConfirmed("".concat(x1, ",").concat(y1, ",").concat(x2, ",").concat(y2));
  }
  function handleUse() {
    if (!confirmed) return;
    onSelect(confirmed);
    onClose();
  }
  var styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'system-ui, sans-serif'
    },
    modal: {
      background: '#fff',
      borderRadius: 14,
      width: '95%',
      maxWidth: 860,
      maxHeight: '92vh',
      boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 20px',
      borderBottom: '1px solid #ece9e2',
      flexShrink: 0
    },
    body: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
      minHeight: 0
    },
    left: {
      width: 220,
      flexShrink: 0,
      padding: '20px 16px',
      borderRight: '1px solid #ece9e2',
      overflowY: 'auto'
    },
    right: {
      flex: 1,
      overflowY: 'auto',
      background: '#f5f4f0',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '16px'
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: 600,
      color: '#aaa',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      marginBottom: 8
    },
    instruction: {
      padding: '10px 12px',
      background: '#f0f7ff',
      borderRadius: 8,
      fontSize: 12,
      color: '#2563eb',
      lineHeight: 1.6
    },
    btn: {
      padding: '9px 14px',
      borderRadius: 8,
      border: 'none',
      background: '#1a1a1a',
      color: '#fff',
      fontSize: 13,
      cursor: 'pointer',
      width: '100%',
      fontFamily: 'inherit',
      marginTop: 12
    },
    coordBox: {
      marginTop: 16,
      padding: 12,
      background: '#f5f4f0',
      borderRadius: 10
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: 20,
      cursor: 'pointer',
      color: '#888'
    },
    navRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 16
    },
    navBtn: {
      padding: '4px 12px',
      borderRadius: 6,
      border: '1px solid #ddd',
      background: '#fff',
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    },
    emptyState: {
      color: '#bbb',
      fontSize: 14,
      textAlign: 'center',
      paddingTop: 60,
      lineHeight: 1.8
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: styles.overlay
  }, /*#__PURE__*/React.createElement("div", {
    style: styles.modal
  }, /*#__PURE__*/React.createElement("div", {
    style: styles.header
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 16
    }
  }, "Pick Signature Position"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: styles.closeBtn
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: styles.body
  }, /*#__PURE__*/React.createElement("div", {
    style: styles.left
  }, /*#__PURE__*/React.createElement("div", {
    style: styles.sectionLabel
  }, "How to use"), /*#__PURE__*/React.createElement("div", {
    style: styles.instruction
  }, "\uD83D\uDDB1 Click and drag on the PDF to draw your signature box, then click Get Coordinates."), numPages && numPages > 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: _objectSpread2(_objectSpread2({}, styles.sectionLabel), {}, {
      marginTop: 16
    })
  }, "Page"), /*#__PURE__*/React.createElement("div", {
    style: styles.navRow
  }, /*#__PURE__*/React.createElement("button", {
    style: styles.navBtn,
    onClick: function onClick() {
      setCurrentPage(function (p) {
        return Math.max(1, p - 1);
      });
      setBox(null);
      setConfirmed(null);
    },
    disabled: currentPage === 1
  }, "\u2190"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, currentPage, " / ", numPages), /*#__PURE__*/React.createElement("button", {
    style: styles.navBtn,
    onClick: function onClick() {
      setCurrentPage(function (p) {
        return Math.min(numPages, p + 1);
      });
      setBox(null);
      setConfirmed(null);
    },
    disabled: currentPage === numPages
  }, "\u2192"))), box && box.w > 5 && /*#__PURE__*/React.createElement("button", {
    style: styles.btn,
    onClick: handleGetCoords
  }, "\uD83D\uDCD0 Get Coordinates"), confirmed && /*#__PURE__*/React.createElement("div", {
    style: styles.coordBox
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#888',
      marginBottom: 4
    }
  }, "Coordinates:"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'monospace',
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 8
    }
  }, confirmed), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#888',
      marginBottom: 10
    }
  }, "You can adjust these manually after applying."), /*#__PURE__*/React.createElement("button", {
    style: styles.btn,
    onClick: handleUse
  }, "\u2713 Use these coordinates"))), /*#__PURE__*/React.createElement("div", {
    style: styles.right
  }, !pdfSource ? /*#__PURE__*/React.createElement("div", {
    style: styles.emptyState
  }, "No PDF provided.", /*#__PURE__*/React.createElement("br", null), "Pass a pdfSource prop to preview.") : /*#__PURE__*/React.createElement("div", {
    ref: containerRef,
    style: {
      position: 'relative',
      display: 'inline-block',
      cursor: 'crosshair',
      userSelect: 'none'
    },
    onMouseDown: onMouseDown,
    onMouseMove: onMouseMove,
    onMouseUp: onMouseUp
  }, /*#__PURE__*/React.createElement(Document, {
    file: pdfSource,
    onLoadSuccess: function onLoadSuccess(_ref2) {
      var numPages = _ref2.numPages;
      return setNumPages(numPages);
    }
  }, /*#__PURE__*/React.createElement(Page, {
    pageNumber: currentPage,
    width: width,
    onLoadSuccess: onPageLoadSuccess,
    onRenderSuccess: measureCanvas
  })), box && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: box.x,
      top: box.y,
      width: box.w,
      height: box.h,
      border: '2px solid #e74c3c',
      background: 'rgba(231,76,60,0.15)',
      pointerEvents: 'none',
      boxSizing: 'border-box'
    }
  }))))));
}

var PORT_LIST = [8080, 1645, 1812, 2083, 2948];
function identifyService(data) {
  var lower = data.toLowerCase();
  if (lower.includes('version')) return 'emsigner';
  if (lower.includes('connection established')) return 'dsigner';
  try {
    var json = JSON.parse(data);
    if (json.status === 'connected') return 'emsigner';
  } catch (_unused) {}
  return null;
}
function createClient() {
  return new Promise(function (resolve, reject) {
    var connections = {};
    var errorCount = 0;
    var resolved = false;
    PORT_LIST.forEach(function (port) {
      var ws = new WebSocket("wss://127.0.0.1:".concat(port));
      ws.onopen = function () {
        return console.log("Port ".concat(port, " opened"));
      };
      ws.onmessage = function (event) {
        var service = identifyService(event.data);
        if (service && !connections[service]) {
          connections[service] = ws;
          console.log("\u2713 ".concat(service, " connected on port ").concat(port));
        }

        // ✅ Wait for BOTH signers before resolving
        // But also resolve after 2 seconds if only one found
        if (!resolved && connections['dsigner'] && connections['emsigner']) {
          resolved = true;
          resolve(connections);
        }
      };
      ws.onerror = function () {
        errorCount++;
        if (errorCount === PORT_LIST.length && !resolved) {
          if (Object.keys(connections).length > 0) {
            // ✅ At least one connected — resolve with what we have
            resolved = true;
            resolve(connections);
          } else {
            reject(new Error('Could not connect to dSigner or eMsigner. Are they running?'));
          }
        }
      };
    });

    // ✅ After 3 seconds — resolve with whatever connected
    // (handles case where only one signer is installed)
    setTimeout(function () {
      if (!resolved) {
        resolved = true;
        if (Object.keys(connections).length > 0) {
          resolve(connections);
        } else {
          reject(new Error('Could not connect. Are dSigner/eMsigner running?'));
        }
      }
    }, 3000);
  });
}
function getConnection(connections) {
  var signer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'dsigner';
  var ws = connections[signer];
  if (!ws) throw new Error("".concat(signer, " is not connected. Is the app open?"));
  return ws;
}

pdfjs.GlobalWorkerOptions.workerSrc = "//unpkg.com/pdfjs-dist@".concat(pdfjs.version, "/build/pdf.worker.min.mjs");
var INPUT_TYPES = [{
  id: 0,
  label: 'Base64',
  placeholder: 'Paste base64 encoded PDF string...'
}, {
  id: 1,
  label: 'File path',
  placeholder: '/Users/you/Documents/file.pdf'
}, {
  id: 2,
  label: 'URL',
  placeholder: 'https://example.com/file.pdf'
}, {
  id: 4,
  label: 'Protected',
  placeholder: 'https://example.com/secure.pdf'
}];
var STAMP_TYPES = [{
  id: 0,
  label: 'Base64',
  placeholder: 'Paste base64 image...'
}, {
  id: 1,
  label: 'File path',
  placeholder: '/Users/you/stamp.png'
}, {
  id: 2,
  label: 'URL',
  placeholder: 'https://example.com/stamp.png'
}];
var SIGN_PAGES = [{
  value: 'all',
  label: 'All pages'
}, {
  value: 'first',
  label: 'First page'
}, {
  value: 'last',
  label: 'Last page'
}, {
  value: 'even',
  label: 'Even pages'
}, {
  value: 'odd',
  label: 'Odd pages'
}, {
  value: 'custom',
  label: 'Custom pages'
}];
function Field(_ref) {
  var label = _ref.label,
    required = _ref.required,
    children = _ref.children;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 5,
      fontSize: 12,
      fontWeight: 500,
      color: '#555'
    }
  }, label, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      padding: '1px 5px',
      borderRadius: 4,
      fontWeight: 500,
      background: required ? '#fff0f0' : '#f5f4f0',
      color: required ? '#d04040' : '#aaa'
    }
  }, required ? 'required' : 'optional')), children);
}
var inp = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: 7,
  border: '1px solid #ece9e2',
  fontSize: 12,
  color: '#1a1a1a',
  background: '#fafaf8',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit'
};
var typeBtn = function typeBtn(active) {
  return {
    padding: '5px 8px',
    borderRadius: 6,
    border: active ? '1.5px solid #1a1a1a' : '1px solid #ece9e2',
    background: active ? '#f5f4f0' : '#fff',
    color: active ? '#1a1a1a' : '#888',
    fontSize: 11,
    fontWeight: active ? 500 : 400,
    cursor: 'pointer',
    fontFamily: 'inherit'
  };
};
var sectionLabel = {
  fontSize: 10,
  fontWeight: 600,
  color: '#aaa',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 8
};
function DsignerWidget(_ref2) {
  var _INPUT_TYPES$find, _STAMP_TYPES$find;
  var onSigned = _ref2.onSigned,
    _ref2$defaultSigner = _ref2.defaultSigner,
    defaultSigner = _ref2$defaultSigner === void 0 ? 'dsigner' : _ref2$defaultSigner,
    _ref2$defaultInputTyp = _ref2.defaultInputType,
    defaultInputType = _ref2$defaultInputTyp === void 0 ? 0 : _ref2$defaultInputTyp,
    _ref2$defaultPdfInput = _ref2.defaultPdfInput,
    defaultPdfInput = _ref2$defaultPdfInput === void 0 ? '' : _ref2$defaultPdfInput,
    _ref2$defaultCoordina = _ref2.defaultCoordinates,
    defaultCoordinates = _ref2$defaultCoordina === void 0 ? '400,100,600,200' : _ref2$defaultCoordina,
    _ref2$defaultLocation = _ref2.defaultLocation,
    defaultLocation = _ref2$defaultLocation === void 0 ? '' : _ref2$defaultLocation,
    _ref2$defaultSignPage = _ref2.defaultSignPage,
    defaultSignPage = _ref2$defaultSignPage === void 0 ? 'all' : _ref2$defaultSignPage,
    _ref2$defaultOutputPa = _ref2.defaultOutputPath,
    defaultOutputPath = _ref2$defaultOutputPa === void 0 ? '' : _ref2$defaultOutputPa,
    _ref2$defaultFormData = _ref2.defaultFormData,
    defaultFormData = _ref2$defaultFormData === void 0 ? '' : _ref2$defaultFormData,
    _ref2$hideOutput = _ref2.hideOutput,
    hideOutput = _ref2$hideOutput === void 0 ? false : _ref2$hideOutput,
    _ref2$height = _ref2.height,
    height = _ref2$height === void 0 ? '100vh' : _ref2$height,
    _ref2$primaryColor = _ref2.primaryColor,
    primaryColor = _ref2$primaryColor === void 0 ? '#1a1a1a' : _ref2$primaryColor,
    _ref2$pdfConfigs = _ref2.pdfConfigs,
    pdfConfigs = _ref2$pdfConfigs === void 0 ? {} : _ref2$pdfConfigs;
  var _useState = useState('pdf'),
    _useState2 = _slicedToArray(_useState, 2),
    activeTab = _useState2[0],
    setActiveTab = _useState2[1];
  var _useState3 = useState(defaultSigner),
    _useState4 = _slicedToArray(_useState3, 2),
    signer = _useState4[0],
    setSigner = _useState4[1];
  var _useState5 = useState(defaultInputType),
    _useState6 = _slicedToArray(_useState5, 2),
    inputType = _useState6[0],
    setInputType = _useState6[1];
  var _useState7 = useState(0),
    _useState8 = _slicedToArray(_useState7, 2),
    stampType = _useState8[0],
    setStampType = _useState8[1];
  var _useState9 = useState(false),
    _useState0 = _slicedToArray(_useState9, 2),
    showOptional = _useState0[0],
    setShowOptional = _useState0[1];
  var _useState1 = useState(false),
    _useState10 = _slicedToArray(_useState1, 2),
    loading = _useState10[0],
    setLoading = _useState10[1];
  var _useState11 = useState(null),
    _useState12 = _slicedToArray(_useState11, 2),
    result = _useState12[0],
    setResult = _useState12[1];
  var _useState13 = useState(defaultPdfInput),
    _useState14 = _slicedToArray(_useState13, 2),
    pdfInput = _useState14[0],
    setPdfInput = _useState14[1];
  var _useState15 = useState(''),
    _useState16 = _slicedToArray(_useState15, 2),
    authHeader = _useState16[0],
    setAuthHeader = _useState16[1];
  var _useState17 = useState(defaultSignPage),
    _useState18 = _slicedToArray(_useState17, 2),
    signPage = _useState18[0],
    setSignPage = _useState18[1];
  var _useState19 = useState(''),
    _useState20 = _slicedToArray(_useState19, 2),
    customPages = _useState20[0],
    setCustomPages = _useState20[1];
  var _useState21 = useState(defaultCoordinates),
    _useState22 = _slicedToArray(_useState21, 2),
    coordinates = _useState22[0],
    setCoordinates = _useState22[1];
  var _useState23 = useState(defaultLocation),
    _useState24 = _slicedToArray(_useState23, 2),
    location = _useState24[0],
    setLocation = _useState24[1];
  var _useState25 = useState('0'),
    _useState26 = _slicedToArray(_useState25, 2),
    textStamp = _useState26[0],
    setTextStamp = _useState26[1];
  var _useState27 = useState(''),
    _useState28 = _slicedToArray(_useState27, 2),
    stampValue = _useState28[0],
    setStampValue = _useState28[1];
  var _useState29 = useState(defaultOutputPath),
    _useState30 = _slicedToArray(_useState29, 2),
    outputPath = _useState30[0],
    setOutputPath = _useState30[1];
  var _useState31 = useState(''),
    _useState32 = _slicedToArray(_useState31, 2),
    qrValue = _useState32[0],
    setQrValue = _useState32[1];
  var _useState33 = useState(''),
    _useState34 = _slicedToArray(_useState33, 2),
    qrX = _useState34[0],
    setQrX = _useState34[1];
  var _useState35 = useState(''),
    _useState36 = _slicedToArray(_useState35, 2),
    qrY = _useState36[0],
    setQrY = _useState36[1];
  var _useState37 = useState(''),
    _useState38 = _slicedToArray(_useState37, 2),
    watermark = _useState38[0],
    setWatermark = _useState38[1];
  var _useState39 = useState('0'),
    _useState40 = _slicedToArray(_useState39, 2),
    lastPage = _useState40[0],
    setLastPage = _useState40[1];
  var _useState41 = useState(defaultFormData),
    _useState42 = _slicedToArray(_useState41, 2),
    formData = _useState42[0],
    setFormData = _useState42[1];
  var _useState43 = useState(null),
    _useState44 = _slicedToArray(_useState43, 2),
    previewSource = _useState44[0],
    setPreviewSource = _useState44[1];
  var _useState45 = useState(null),
    _useState46 = _slicedToArray(_useState45, 2),
    signedPreview = _useState46[0],
    setSignedPreview = _useState46[1];
  var _useState47 = useState(null),
    _useState48 = _slicedToArray(_useState47, 2),
    numPages = _useState48[0],
    setNumPages = _useState48[1];
  var _useState49 = useState(1),
    _useState50 = _slicedToArray(_useState49, 2),
    currentPage = _useState50[0],
    setCurrentPage = _useState50[1];
  var _useState51 = useState(false),
    _useState52 = _slicedToArray(_useState51, 2),
    drawing = _useState52[0],
    setDrawing = _useState52[1];
  var _useState53 = useState(null),
    _useState54 = _slicedToArray(_useState53, 2),
    box = _useState54[0],
    setBox = _useState54[1];
  var _useState55 = useState(null),
    _useState56 = _slicedToArray(_useState55, 2),
    pdfDimensions = _useState56[0],
    setPdfDimensions = _useState56[1];
  var _useState57 = useState(null),
    _useState58 = _slicedToArray(_useState57, 2),
    canvasSize = _useState58[0],
    setCanvasSize = _useState58[1];
  var _useState59 = useState({}),
    _useState60 = _slicedToArray(_useState59, 2),
    connections = _useState60[0],
    setConnections = _useState60[1];
  var _useState61 = useState('connecting'),
    _useState62 = _slicedToArray(_useState61, 2),
    connectionStatus = _useState62[0],
    setConnectionStatus = _useState62[1];
  var _useState63 = useState('detached'),
    _useState64 = _slicedToArray(_useState63, 2),
    emSignType = _useState64[0],
    setEmSignType = _useState64[1];
  var _useState65 = useState('ALL'),
    _useState66 = _slicedToArray(_useState65, 2),
    emCertType = _useState66[0],
    setEmCertType = _useState66[1];
  var _useState67 = useState(''),
    _useState68 = _slicedToArray(_useState67, 2),
    emReason = _useState68[0],
    setEmReason = _useState68[1];
  var _useState69 = useState(''),
    _useState70 = _slicedToArray(_useState69, 2),
    emIssuerName = _useState70[0],
    setEmIssuerName = _useState70[1];
  var _useState71 = useState('false'),
    _useState72 = _slicedToArray(_useState71, 2),
    emExpiryCheck = _useState72[0],
    setEmExpiryCheck = _useState72[1];
  var containerRef = useRef(null);
  var startPos = useRef(null);

  // ── Build preview ─────────────────────────────────────────────────────────
  function buildPreview(val, type) {
    if (!val || !val.trim()) return null;
    if (type === 0) return "data:application/pdf;base64,".concat(val.trim());
    if (type === 2 || type === 4) return val.trim();
    return null;
  }

  // ── On mount effects ──────────────────────────────────────────────────────
  useEffect(function () {
    if (defaultPdfInput) {
      var src = buildPreview(defaultPdfInput, defaultInputType);
      setPreviewSource(src);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(function () {
    createClient().then(function (conns) {
      setConnections(conns);
      setConnectionStatus('connected');
      console.log('Connected:', Object.keys(conns));
      // [DEBUG] Confirm both signer keys are really present.
      // If 'emsigner' is missing here, getConnection() has nothing
      // real to fall back to — that's the first thing to rule out.
      console.log('[debug] connection keys:', Object.keys(conns), conns);
    })["catch"](function () {
      return setConnectionStatus('error');
    });
  }, []);

  // ── Type switch ───────────────────────────────────────────────────────────
  function handleTypeSwitch(newType) {
    setInputType(newType);
    setSignedPreview(null);
    setBox(null);
    if (pdfConfigs[newType]) {
      var cfg = pdfConfigs[newType];
      var val = cfg.pdfInput || '';
      setPdfInput(val);
      setOutputPath(cfg.outputPath || outputPath);
      setPreviewSource(buildPreview(val, newType));
    } else {
      setPdfInput('');
      setPreviewSource(null);
    }
  }

  // ── Page callbacks ────────────────────────────────────────────────────────
  function onPageLoadSuccess(page) {
    setPdfDimensions({
      width: page.originalWidth || page.width,
      height: page.originalHeight || page.height
    });
    setTimeout(function () {
      var _containerRef$current;
      var canvas = (_containerRef$current = containerRef.current) === null || _containerRef$current === void 0 ? void 0 : _containerRef$current.querySelector('canvas');
      if (canvas) setCanvasSize({
        width: canvas.offsetWidth,
        height: canvas.offsetHeight
      });
    }, 150);
  }
  function onRenderSuccess() {
    setTimeout(function () {
      var _containerRef$current2;
      var canvas = (_containerRef$current2 = containerRef.current) === null || _containerRef$current2 === void 0 ? void 0 : _containerRef$current2.querySelector('canvas');
      if (canvas) setCanvasSize({
        width: canvas.offsetWidth,
        height: canvas.offsetHeight
      });
    }, 100);
  }

  // ── Drawing ───────────────────────────────────────────────────────────────
  function getPos(e) {
    var rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, e.clientX - rect.left),
      y: Math.max(0, e.clientY - rect.top)
    };
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
    var pos = getPos(e);
    setBox({
      x: Math.min(startPos.current.x, pos.x),
      y: Math.min(startPos.current.y, pos.y),
      w: Math.abs(pos.x - startPos.current.x),
      h: Math.abs(pos.y - startPos.current.y)
    });
  }
  function onMouseUp() {
    setDrawing(false);
    if (box && box.w > 5 && canvasSize && pdfDimensions) {
      var scaleX = pdfDimensions.width / canvasSize.width;
      var scaleY = pdfDimensions.height / canvasSize.height;
      var x1 = Math.round(box.x * scaleX);
      var x2 = Math.round((box.x + box.w) * scaleX);
      var y1 = Math.round(pdfDimensions.height - (box.y + box.h) * scaleY);
      var y2 = Math.round(pdfDimensions.height - box.y * scaleY);
      setCoordinates("".concat(x1, ",").concat(y1, ",").concat(x2, ",").concat(y2));
    }
  }

  // ── Build dSigner input ───────────────────────────────────────────────────
  function buildInput() {
    if (!pdfInput.trim()) return null;
    if (inputType === 4) return "{4,{\"".concat(pdfInput.trim(), "\",").concat(authHeader.trim(), "}}");
    return "{".concat(inputType, ",\"").concat(pdfInput.trim(), "\"}");
  }

  // ── Sign PDF ──────────────────────────────────────────────────────────────
  function handleSignPdf() {
    return _handleSignPdf.apply(this, arguments);
  } // ── Sign Form ─────────────────────────────────────────────────────────────
  function _handleSignPdf() {
    _handleSignPdf = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var finalSignPage, ws, res, lines, input, base64Pdf, parsed, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            setLoading(true);
            setResult(null);
            setSignedPreview(null);
            _context.p = 1;
            finalSignPage = signPage === 'custom' ? customPages.trim() : signPage;
            ws = getConnection(connections, signer);
            if (!(signer === 'emsigner')) {
              _context.n = 4;
              break;
            }
            lines = ["emsigneraction=pdfsign", "tbs=".concat(pdfInput.trim()), "outputpath=".concat(outputPath || ''), "signaction=1", "coordinate=".concat(coordinates), "pageno=".concat(finalSignPage), "location=".concat(location || 'Kathmandu'), "signtype=".concat(emSignType), "certtype=".concat(emCertType), "expirycheck=".concat(emExpiryCheck), "issuername=".concat(emIssuerName), "reason=".concat(emReason)]; // [DEBUG] eMsigner-only diagnostics — does not touch the dsigner path.
            console.log('[emsigner] socket readyState before send:', ws && ws.readyState);
            console.log('[emsigner] payload being sent:\n' + lines.join('\n'));
            ws.send(lines.join('\n'));
            _context.n = 2;
            return new Promise(function (resolve, reject) {
              var timeout = setTimeout(function () {
                reject(new Error('emsigner dis not reposnd within60s-check if'));
              }, 60000);
              ws.onmessage = function (event) {
                var raw = event.data;
                // [DEBUG] See exactly what eMsigner replies with, before any filtering.
                console.log('[emsigner] raw message received:', JSON.stringify(raw));
                if (!raw || raw.trim() === '') return;
                if (raw.toLowerCase().includes('version')) return;
                clearTimeout(timeout);
                try {
                  resolve(JSON.parse(raw));
                } catch (_unused) {
                  resolve(raw);
                }
              };
              ws.onerror = function () {
                clearTimeout(timeout);
                reject(new Error('eMsigner signPdf failed'));
              };
            });
          case 2:
            res = _context.v;
            if (!(!res || typeof res === 'string' && res.trim() === '')) {
              _context.n = 3;
              break;
            }
            throw new Error('eMsigner returned an empty response — check that the eMsigner app is running and actually connected.');
          case 3:
            _context.n = 7;
            break;
          case 4:
            input = buildInput();
            if (input) {
              _context.n = 5;
              break;
            }
            throw new Error('PDF input is required');
          case 5:
            _context.n = 6;
            return signPdf(ws, {
              input: input,
              signPage: finalSignPage,
              coordinates: coordinates || '400,100,600,200',
              location: location || 'Kathmandu',
              textStamp: parseInt(textStamp),
              lastPage: parseInt(lastPage),
              stamp: textStamp === '1' && stampValue ? "{".concat(stampType, ",\"").concat(stampValue, "\"}") : null,
              qr: qrValue || null,
              qrX: qrX || null,
              qrY: qrY || null,
              watermark: watermark || null,
              outputPath: outputPath || null
            });
          case 6:
            res = _context.v;
          case 7:
            base64Pdf = null;
            try {
              parsed = JSON.parse(res);
              if (parsed.message && parsed.message.startsWith('JVBER')) base64Pdf = parsed.message;
            } catch (_unused2) {
              if (typeof res === 'string' && res.trim().startsWith('JVBER')) base64Pdf = res.trim();
            }
            if (base64Pdf) setSignedPreview("data:application/pdf;base64,".concat(base64Pdf));
            setResult({
              type: 'success',
              message: outputPath ? "\u2713 PDF signed!\nSaved to: ".concat(outputPath) : '✓ PDF signed successfully!'
            });
            if (onSigned) onSigned({
              status: 'success',
              message: res,
              base64: base64Pdf
            });
            _context.n = 9;
            break;
          case 8:
            _context.p = 8;
            _t = _context.v;
            setResult({
              type: 'error',
              message: '✗ ' + _t.message
            });
          case 9:
            _context.p = 9;
            setLoading(false);
            return _context.f(9);
          case 10:
            return _context.a(2);
        }
      }, _callee, null, [[1, 8, 9, 10]]);
    }));
    return _handleSignPdf.apply(this, arguments);
  }
  function handleSignForm() {
    return _handleSignForm.apply(this, arguments);
  }
  function _handleSignForm() {
    _handleSignForm = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var ws, res, lines, _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            setLoading(true);
            setResult(null);
            _context2.p = 1;
            if (formData.trim()) {
              _context2.n = 2;
              break;
            }
            throw new Error('Form data is required');
          case 2:
            ws = getConnection(connections, signer);
            if (!(signer === 'emsigner')) {
              _context2.n = 5;
              break;
            }
            lines = ["emsigneraction=sign", "datatosign=".concat(formData.trim()), "signaction=sign", "certtype=".concat(emCertType), "expirycheck=".concat(emExpiryCheck), "issuername=".concat(emIssuerName), "certclass=1|2|3"]; // [DEBUG] Same eMsigner diagnostics as handleSignPdf.
            console.log('[emsigner] socket readyState before send:', ws && ws.readyState);
            console.log('[emsigner] payload being sent:\n' + lines.join('\n'));
            ws.send(lines.join('\n'));
            _context2.n = 3;
            return new Promise(function (resolve, reject) {
              var timeout = setTimeout(function () {
                reject(new Error('emsigner dis not reposnd within60s-check if'));
              }, 60000);
              ws.onmessage = function (event) {
                var raw = event.data;
                console.log('[emsigner] raw message received:', JSON.stringify(raw));
                if (!raw || raw.trim() === '') return;
                if (raw.toLowerCase().includes('version')) return;
                clearTimeout(timeout);
                try {
                  resolve(JSON.parse(raw));
                } catch (_unused3) {
                  resolve(raw);
                }
              };
              ws.onerror = function () {
                clearTimeout(timeout);
                reject(new Error('eMsigner signForm failed'));
              };
            });
          case 3:
            res = _context2.v;
            if (!(!res || typeof res === 'string' && res.trim() === '')) {
              _context2.n = 4;
              break;
            }
            throw new Error('eMsigner returned an empty response — check that the eMsigner app is running and actually connected.');
          case 4:
            _context2.n = 7;
            break;
          case 5:
            _context2.n = 6;
            return signForm(ws, {
              formData: formData.trim()
            });
          case 6:
            res = _context2.v;
          case 7:
            setResult({
              type: 'success',
              message: '✓ Form signed!\n\nStatus: ' + (res.status || '')
            });
            if (onSigned) onSigned({
              status: res.status || 'success',
              message: res.message || res
            });
            _context2.n = 9;
            break;
          case 8:
            _context2.p = 8;
            _t2 = _context2.v;
            setResult({
              type: 'error',
              message: '✗ ' + _t2.message
            });
          case 9:
            _context2.p = 9;
            setLoading(false);
            return _context2.f(9);
          case 10:
            return _context2.a(2);
        }
      }, _callee2, null, [[1, 8, 9, 10]]);
    }));
    return _handleSignForm.apply(this, arguments);
  }
  var activePdf = signedPreview || previewSource;

  // ── Render ────────────────────────────────────────────────────────────────
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: height,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: '#f5f4f0',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 320,
      flexShrink: 0,
      background: '#fff',
      borderRight: '1px solid #ece9e2',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      borderBottom: '1px solid #ece9e2',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: '#1a1a1a',
      letterSpacing: '-0.5px'
    }
  }, "dSigner"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#888',
      marginTop: 2
    }
  }, "Sign PDFs and forms via dSigner / eMsigner"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      marginTop: 4,
      color: connectionStatus === 'connected' ? '#1a7a3a' : connectionStatus === 'error' ? '#d04040' : '#888'
    }
  }, connectionStatus === 'connecting' && '⏳ Connecting...', connectionStatus === 'connected' && "\u2705 ".concat(Object.keys(connections).join(' & '), " connected"), connectionStatus === 'error' && '❌ Could not connect — is dSigner/eMsigner open?')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      padding: '10px 12px',
      background: '#f5f4f0',
      flexShrink: 0
    }
  }, ['pdf', 'form'].map(function (tab) {
    return /*#__PURE__*/React.createElement("button", {
      key: tab,
      style: {
        flex: 1,
        padding: '7px 0',
        borderRadius: 8,
        border: 'none',
        background: activeTab === tab ? '#fff' : 'transparent',
        color: activeTab === tab ? '#1a1a1a' : '#888',
        fontWeight: activeTab === tab ? 500 : 400,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
      },
      onClick: function onClick() {
        setActiveTab(tab);
        setResult(null);
      }
    }, tab === 'pdf' ? 'Sign PDF' : 'Sign Form');
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: sectionLabel
  }, "Signer"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 6,
      marginBottom: 14
    }
  }, ['dsigner', 'emsigner'].map(function (s) {
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      style: {
        padding: 8,
        borderRadius: 8,
        border: signer === s ? "2px solid ".concat(primaryColor) : '1px solid #ece9e2',
        background: signer === s ? primaryColor : '#fff',
        color: signer === s ? '#fff' : '#888',
        fontSize: 12,
        fontWeight: signer === s ? 500 : 400,
        cursor: 'pointer',
        fontFamily: 'inherit'
      },
      onClick: function onClick() {
        return setSigner(s);
      }
    }, s);
  })), activeTab === 'pdf' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: sectionLabel
  }, "Input type"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2,1fr)',
      gap: 5,
      marginBottom: 12
    }
  }, INPUT_TYPES.map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      style: typeBtn(inputType === t.id),
      onClick: function onClick() {
        return handleTypeSwitch(t.id);
      }
    }, t.label);
  })), /*#__PURE__*/React.createElement(Field, {
    label: "PDF input",
    required: true
  }, /*#__PURE__*/React.createElement("textarea", {
    style: _objectSpread2(_objectSpread2({}, inp), {}, {
      minHeight: 55,
      resize: 'vertical',
      fontFamily: 'monospace',
      fontSize: 11
    }),
    value: pdfInput,
    onChange: function onChange(e) {
      var val = e.target.value;
      setPdfInput(val);
      setPreviewSource(buildPreview(val, inputType));
      setSignedPreview(null);
      setBox(null);
    },
    placeholder: (_INPUT_TYPES$find = INPUT_TYPES.find(function (t) {
      return t.id === inputType;
    })) === null || _INPUT_TYPES$find === void 0 ? void 0 : _INPUT_TYPES$find.placeholder
  })), inputType === 4 && /*#__PURE__*/React.createElement(Field, {
    label: "Auth header",
    required: true
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: authHeader,
    onChange: function onChange(e) {
      return setAuthHeader(e.target.value);
    },
    placeholder: "{\"Authorization\": \"Bearer token\"}"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Sign page",
    required: true
  }, /*#__PURE__*/React.createElement("select", {
    style: inp,
    value: signPage,
    onChange: function onChange(e) {
      return setSignPage(e.target.value);
    }
  }, SIGN_PAGES.map(function (p) {
    return /*#__PURE__*/React.createElement("option", {
      key: p.value,
      value: p.value
    }, p.label);
  }))), signPage === 'custom' && /*#__PURE__*/React.createElement(Field, {
    label: "Page numbers",
    required: true
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: customPages,
    onChange: function onChange(e) {
      return setCustomPages(e.target.value);
    },
    placeholder: "e.g. 1,2,3"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Coordinates",
    required: true
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: coordinates,
    onChange: function onChange(e) {
      return setCoordinates(e.target.value);
    }
  }), previewSource && inputType !== 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#2563eb',
      marginTop: 3
    }
  }, "\uD83D\uDCD0 Draw a box on the PDF (right) to auto-fill")), /*#__PURE__*/React.createElement(Field, {
    label: "Location"
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: location,
    onChange: function onChange(e) {
      return setLocation(e.target.value);
    },
    placeholder: "Kathmandu"
  })), signer === 'dsigner' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
    label: "Stamp type",
    required: true
  }, /*#__PURE__*/React.createElement("select", {
    style: inp,
    value: textStamp,
    onChange: function onChange(e) {
      return setTextStamp(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "0"
  }, "Text stamp"), /*#__PURE__*/React.createElement("option", {
    value: "1"
  }, "Image stamp"))), textStamp === '1' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 5,
      marginBottom: 8
    }
  }, STAMP_TYPES.map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      style: typeBtn(stampType === t.id),
      onClick: function onClick() {
        return setStampType(t.id);
      }
    }, t.label);
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Stamp value",
    required: true
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: stampValue,
    onChange: function onChange(e) {
      return setStampValue(e.target.value);
    },
    placeholder: (_STAMP_TYPES$find = STAMP_TYPES.find(function (t) {
      return t.id === stampType;
    })) === null || _STAMP_TYPES$find === void 0 ? void 0 : _STAMP_TYPES$find.placeholder
  })))), signer === 'emsigner' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
    label: "Sign type"
  }, /*#__PURE__*/React.createElement("select", {
    style: inp,
    value: emSignType,
    onChange: function onChange(e) {
      return setEmSignType(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "detached"
  }, "Detached"), /*#__PURE__*/React.createElement("option", {
    value: "attached"
  }, "Attached"))), /*#__PURE__*/React.createElement(Field, {
    label: "Cert type"
  }, /*#__PURE__*/React.createElement("select", {
    style: inp,
    value: emCertType,
    onChange: function onChange(e) {
      return setEmCertType(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "ALL"
  }, "ALL"), /*#__PURE__*/React.createElement("option", {
    value: "DSC"
  }, "DSC"))), /*#__PURE__*/React.createElement(Field, {
    label: "Reason"
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: emReason,
    onChange: function onChange(e) {
      return setEmReason(e.target.value);
    },
    placeholder: "e.g. test"
  }))), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'none',
      border: 'none',
      color: '#888',
      fontSize: 11,
      cursor: 'pointer',
      padding: '4px 0 8px',
      fontFamily: 'inherit'
    },
    onClick: function onClick() {
      return setShowOptional(function (v) {
        return !v;
      });
    }
  }, showOptional ? '▲ Hide' : '▼ Show', " optional parameters"), showOptional && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid #ece9e2',
      paddingTop: 12
    }
  }, !hideOutput && /*#__PURE__*/React.createElement(Field, {
    label: "Output path"
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: outputPath,
    onChange: function onChange(e) {
      return setOutputPath(e.target.value);
    },
    placeholder: "/Users/you/signed.pdf"
  })), signer === 'dsigner' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
    label: "QR code"
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: qrValue,
    onChange: function onChange(e) {
      return setQrValue(e.target.value);
    },
    placeholder: "{2,\"https://example.com/qr.png\"}"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "QR X"
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: qrX,
    onChange: function onChange(e) {
      return setQrX(e.target.value);
    },
    placeholder: "90"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "QR Y"
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: qrY,
    onChange: function onChange(e) {
      return setQrY(e.target.value);
    },
    placeholder: "90"
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Watermark"
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: watermark,
    onChange: function onChange(e) {
      return setWatermark(e.target.value);
    },
    placeholder: "watermark text"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Last page"
  }, /*#__PURE__*/React.createElement("select", {
    style: inp,
    value: lastPage,
    onChange: function onChange(e) {
      return setLastPage(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "0"
  }, "No extra last page"), /*#__PURE__*/React.createElement("option", {
    value: "1"
  }, "Add last page")))), signer === 'emsigner' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
    label: "Issuer name"
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: emIssuerName,
    onChange: function onChange(e) {
      return setEmIssuerName(e.target.value);
    },
    placeholder: "optional"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Expiry check"
  }, /*#__PURE__*/React.createElement("select", {
    style: inp,
    value: emExpiryCheck,
    onChange: function onChange(e) {
      return setEmExpiryCheck(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "false"
  }, "false"), /*#__PURE__*/React.createElement("option", {
    value: "true"
  }, "true")))))), activeTab === 'form' && /*#__PURE__*/React.createElement(Field, {
    label: "Form data",
    required: true
  }, /*#__PURE__*/React.createElement("textarea", {
    style: _objectSpread2(_objectSpread2({}, inp), {}, {
      minHeight: 80,
      resize: 'vertical',
      fontFamily: 'monospace',
      fontSize: 11
    }),
    value: formData,
    onChange: function onChange(e) {
      return setFormData(e.target.value);
    },
    placeholder: signer === 'emsigner' ? 'base64 encoded data...' : "name='Hari'|class=8|roll=1"
  })), result && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      padding: 10,
      borderRadius: 8,
      fontSize: 11,
      fontFamily: 'monospace',
      wordBreak: 'break-all',
      whiteSpace: 'pre-wrap',
      background: result.type === 'success' ? '#f0fff4' : '#fff0f0',
      color: result.type === 'success' ? '#1a7a3a' : '#d04040',
      border: "1px solid ".concat(result.type === 'success' ? '#b8f0cc' : '#f5c0c0')
    }
  }, result.message)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px',
      borderTop: '1px solid #ece9e2',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      width: '100%',
      padding: 12,
      borderRadius: 10,
      border: 'none',
      background: loading ? '#888' : primaryColor,
      color: '#fff',
      fontSize: 14,
      fontWeight: 500,
      cursor: loading ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      transition: 'background 0.15s'
    },
    onClick: activeTab === 'pdf' ? handleSignPdf : handleSignForm,
    disabled: loading
  }, loading ? 'Signing...' : activeTab === 'pdf' ? 'Sign PDF' : 'Sign Form'))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '11px 20px',
      borderBottom: '1px solid #e0ddd5',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: '#1a1a1a'
    }
  }, signedPreview ? '✅ Signed PDF' : previewSource ? '📄 PDF Preview — draw box to set coordinates' : '📄 PDF Preview'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, signedPreview && /*#__PURE__*/React.createElement("button", {
    style: {
      fontSize: 11,
      padding: '4px 10px',
      borderRadius: 6,
      border: '1px solid #ece9e2',
      background: '#fff',
      cursor: 'pointer',
      fontFamily: 'inherit'
    },
    onClick: function onClick() {
      return setSignedPreview(null);
    }
  }, "\u2190 Original"), numPages && numPages > 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      padding: '3px 8px',
      borderRadius: 5,
      border: '1px solid #ddd',
      background: '#fff',
      cursor: 'pointer'
    },
    onClick: function onClick() {
      return setCurrentPage(function (p) {
        return Math.max(1, p - 1);
      });
    },
    disabled: currentPage === 1
  }, "\u2190"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#555'
    }
  }, currentPage, " / ", numPages), /*#__PURE__*/React.createElement("button", {
    style: {
      padding: '3px 8px',
      borderRadius: 5,
      border: '1px solid #ddd',
      background: '#fff',
      cursor: 'pointer'
    },
    onClick: function onClick() {
      return setCurrentPage(function (p) {
        return Math.min(numPages, p + 1);
      });
    },
    disabled: currentPage === numPages
  }, "\u2192")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      background: '#f0efe9',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: 24
    }
  }, !activePdf ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: '#bbb',
      paddingTop: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 48,
      marginBottom: 12
    }
  }, "\uD83D\uDCC4"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14
    }
  }, "Enter a PDF input on the left to preview"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 6,
      color: '#ccc'
    }
  }, "Then draw a box to set your signature position")) : /*#__PURE__*/React.createElement("div", {
    ref: containerRef,
    style: {
      position: 'relative',
      display: 'inline-block',
      cursor: signedPreview ? 'default' : 'crosshair',
      userSelect: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    },
    onMouseDown: onMouseDown,
    onMouseMove: onMouseMove,
    onMouseUp: onMouseUp
  }, /*#__PURE__*/React.createElement(Document, {
    file: activePdf,
    onLoadSuccess: function onLoadSuccess(_ref3) {
      var numPages = _ref3.numPages;
      setNumPages(numPages);
      setCurrentPage(1);
    },
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement(Page, {
    pageNumber: currentPage,
    width: Math.min(700, window.innerWidth - 360),
    onLoadSuccess: onPageLoadSuccess,
    onRenderSuccess: onRenderSuccess
  })), !signedPreview && box && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: box.x,
      top: box.y,
      width: box.w,
      height: box.h,
      border: '2px solid #e74c3c',
      background: 'rgba(231,76,60,0.15)',
      pointerEvents: 'none',
      boxSizing: 'border-box'
    }
  }), !signedPreview && box && box.w > 5 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: box.x,
      top: box.y + box.h + 4,
      background: '#e74c3c',
      color: '#fff',
      fontSize: 10,
      padding: '2px 6px',
      borderRadius: 4,
      fontFamily: 'monospace',
      pointerEvents: 'none',
      whiteSpace: 'nowrap'
    }
  }, coordinates)))));
}

function emsignerSignPdf(ws) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new Promise(function (resolve, reject) {
    var tbs = options.tbs,
      outputPath = options.outputPath,
      _options$coordinate = options.coordinate,
      coordinate = _options$coordinate === void 0 ? '400,100,600,200' : _options$coordinate,
      _options$pageno = options.pageno,
      pageno = _options$pageno === void 0 ? 'all' : _options$pageno,
      _options$location = options.location,
      location = _options$location === void 0 ? 'Kathmandu' : _options$location,
      _options$signtype = options.signtype,
      signtype = _options$signtype === void 0 ? 'detached' : _options$signtype,
      _options$certtype = options.certtype,
      certtype = _options$certtype === void 0 ? 'ALL' : _options$certtype,
      _options$expirycheck = options.expirycheck,
      expirycheck = _options$expirycheck === void 0 ? false : _options$expirycheck,
      _options$issuername = options.issuername,
      issuername = _options$issuername === void 0 ? '' : _options$issuername,
      _options$reason = options.reason,
      reason = _options$reason === void 0 ? '' : _options$reason;
    if (!tbs) return reject(new Error('tbs (input) is required'));
    var lines = ["emsigneraction=pdfsign", "tbs=".concat(tbs), "outputpath=".concat(outputPath || ''), "signaction=1", "coordinate=".concat(coordinate), "pageno=".concat(pageno), "location=".concat(location), "signtype=".concat(signtype), "certtype=".concat(certtype), "expirycheck=".concat(expirycheck), "issuername=".concat(issuername), "reason=".concat(reason)];
    var timeout = setTimeout(function () {
      reject(new Error('eMsigner did not respond within 60s'));
    }, 60000);
    ws.send(lines.join('\n'));
    ws.onmessage = function (event) {
      var raw = event.data;
      if (!raw || raw.trim() === '') return;
      if (raw.toLowerCase().includes('connection established')) return;
      if (raw.toLowerCase().includes('version')) return;
      clearTimeout(timeout);
      try {
        resolve(JSON.parse(raw));
      } catch (_unused) {
        resolve(raw);
      }
    };
    ws.onerror = function () {
      clearTimeout(timeout);
      reject(new Error('eMsigner signPdf failed'));
    };
  });
}

function emsignerSignData(ws) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new Promise(function (resolve, reject) {
    var dataToSign = options.dataToSign,
      _options$certtype = options.certtype,
      certtype = _options$certtype === void 0 ? 'ALL' : _options$certtype,
      _options$expirycheck = options.expirycheck,
      expirycheck = _options$expirycheck === void 0 ? false : _options$expirycheck,
      _options$issuername = options.issuername,
      issuername = _options$issuername === void 0 ? '' : _options$issuername,
      _options$certclass = options.certclass,
      certclass = _options$certclass === void 0 ? '1|2|3' : _options$certclass;
    if (!dataToSign) return reject(new Error('dataToSign is required'));
    var lines = ["emsigneraction=sign", "datatosign=".concat(dataToSign), "signaction=sign", "certtype=".concat(certtype), "expirycheck=".concat(expirycheck), "issuername=".concat(issuername), "certclass=".concat(certclass)];
    ws.send(lines.join('\n'));
    ws.onmessage = function (event) {
      var raw = event.data;
      if (raw.toLowerCase().includes('connection established')) return;
      try {
        resolve(JSON.parse(raw));
      } catch (_unused) {
        resolve(raw);
      }
    };
    ws.onerror = function () {
      return reject(new Error('eMsigner signData failed'));
    };
  });
}

var cachedConnections = null;
function ensureConnection(_x) {
  return _ensureConnection.apply(this, arguments);
} // ── Headless sign function — websocket ko kaam yo function le nai garcha ──
function _ensureConnection() {
  _ensureConnection = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(signer) {
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          if (cachedConnections) {
            _context.n = 2;
            break;
          }
          _context.n = 1;
          return createClient();
        case 1:
          cachedConnections = _context.v;
        case 2:
          return _context.a(2, getConnection(cachedConnections, signer));
      }
    }, _callee);
  }));
  return _ensureConnection.apply(this, arguments);
}
function sign() {
  return _sign.apply(this, arguments);
}
function _sign() {
  _sign = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var options,
      _options$signer,
      signer,
      tbs,
      _options$coordinate,
      coordinate,
      _options$pageno,
      pageno,
      _options$location,
      location,
      _options$outputPath,
      outputPath,
      _options$signtype,
      signtype,
      _options$certtype,
      certtype,
      _options$expirycheck,
      expirycheck,
      _options$issuername,
      issuername,
      _options$reason,
      reason,
      ws,
      lines,
      _yield$import,
      signPdf,
      _args2 = arguments;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          options = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {};
          _options$signer = options.signer, signer = _options$signer === void 0 ? 'dsigner' : _options$signer, tbs = options.tbs, _options$coordinate = options.coordinate, coordinate = _options$coordinate === void 0 ? '400,100,600,200' : _options$coordinate, _options$pageno = options.pageno, pageno = _options$pageno === void 0 ? 'all' : _options$pageno, _options$location = options.location, location = _options$location === void 0 ? 'Kathmandu' : _options$location, _options$outputPath = options.outputPath, outputPath = _options$outputPath === void 0 ? '' : _options$outputPath, _options$signtype = options.signtype, signtype = _options$signtype === void 0 ? 'detached' : _options$signtype, _options$certtype = options.certtype, certtype = _options$certtype === void 0 ? 'ALL' : _options$certtype, _options$expirycheck = options.expirycheck, expirycheck = _options$expirycheck === void 0 ? false : _options$expirycheck, _options$issuername = options.issuername, issuername = _options$issuername === void 0 ? '' : _options$issuername, _options$reason = options.reason, reason = _options$reason === void 0 ? '' : _options$reason;
          if (tbs) {
            _context2.n = 1;
            break;
          }
          throw new Error('tbs (PDF input) is required');
        case 1:
          _context2.n = 2;
          return ensureConnection(signer);
        case 2:
          ws = _context2.v;
          if (!(signer === 'emsigner')) {
            _context2.n = 3;
            break;
          }
          lines = ["emsigneraction=pdfsign", "tbs=".concat(tbs), "outputpath=".concat(outputPath), "signaction=1", "coordinate=".concat(coordinate), "pageno=".concat(pageno), "location=".concat(location), "signtype=".concat(signtype), "certtype=".concat(certtype), "expirycheck=".concat(expirycheck), "issuername=".concat(issuername), "reason=".concat(reason)];
          return _context2.a(2, new Promise(function (resolve, reject) {
            ws.onmessage = function (e) {
              var raw = e.data;
              if (raw.toLowerCase().includes('connection established')) return;
              try {
                resolve(JSON.parse(raw));
              } catch (_unused) {
                resolve(raw);
              }
            };
            ws.onerror = function () {
              return reject(new Error('eMsigner sign failed'));
            };
            ws.send(lines.join('\n'));
          }));
        case 3:
          _context2.n = 4;
          return Promise.resolve().then(function () { return signPdf$1; });
        case 4:
          _yield$import = _context2.v;
          signPdf = _yield$import.signPdf;
          return _context2.a(2, signPdf(ws, {
            input: "{1,\"".concat(tbs, "\"}"),
            signPage: pageno,
            coordinates: coordinate,
            location: location,
            outputPath: outputPath
          }));
      }
    }, _callee2);
  }));
  return _sign.apply(this, arguments);
}

pdfjs.GlobalWorkerOptions.workerSrc = "//unpkg.com/pdfjs-dist@".concat(pdfjs.version, "/build/pdf.worker.min.mjs");
var MOBILE_BREAKPOINT = 640;

// ── Named position presets for popup mode (desktop only — see isMobile logic below) ──
var POSITION_PRESETS = {
  center: {
    overlay: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    popup: {
      width: '95vw',
      height: '92vh'
    }
  },
  'top-right': {
    overlay: {
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      background: 'transparent',
      pointerEvents: 'none'
    },
    popup: {
      width: 420,
      height: 560,
      margin: 20,
      pointerEvents: 'auto'
    }
  },
  'top-left': {
    overlay: {
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      background: 'transparent',
      pointerEvents: 'none'
    },
    popup: {
      width: 420,
      height: 560,
      margin: 20,
      pointerEvents: 'auto'
    }
  },
  'bottom-right': {
    overlay: {
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      background: 'transparent',
      pointerEvents: 'none'
    },
    popup: {
      width: 420,
      height: 560,
      margin: 20,
      pointerEvents: 'auto'
    }
  },
  'bottom-left': {
    overlay: {
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      background: 'transparent',
      pointerEvents: 'none'
    },
    popup: {
      width: 420,
      height: 560,
      margin: 20,
      pointerEvents: 'auto'
    }
  }
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
function PdfViewer(_ref) {
  var pdfSource = _ref.pdfSource,
    onCoordinateSelect = _ref.onCoordinateSelect,
    onClose = _ref.onClose,
    _ref$inline = _ref.inline,
    inline = _ref$inline === void 0 ? false : _ref$inline,
    _ref$width = _ref.width,
    width = _ref$width === void 0 ? 700 : _ref$width,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? '100%' : _ref$height,
    _ref$showCoordinatePi = _ref.showCoordinatePicker,
    showCoordinatePicker = _ref$showCoordinatePi === void 0 ? true : _ref$showCoordinatePi,
    _ref$enableSigning = _ref.enableSigning,
    enableSigning = _ref$enableSigning === void 0 ? false : _ref$enableSigning,
    _ref$signer = _ref.signer,
    signer = _ref$signer === void 0 ? 'dsigner' : _ref$signer,
    _ref$inputType = _ref.inputType,
    inputType = _ref$inputType === void 0 ? 0 : _ref$inputType,
    _ref$pdfInputValue = _ref.pdfInputValue,
    pdfInputValue = _ref$pdfInputValue === void 0 ? null : _ref$pdfInputValue,
    _ref$location = _ref.location,
    location = _ref$location === void 0 ? 'Kathmandu' : _ref$location,
    _ref$outputPath = _ref.outputPath,
    outputPath = _ref$outputPath === void 0 ? '' : _ref$outputPath,
    _ref$onSigned = _ref.onSigned,
    onSigned = _ref$onSigned === void 0 ? null : _ref$onSigned,
    _ref$popupPosition = _ref.popupPosition,
    popupPosition = _ref$popupPosition === void 0 ? 'center' : _ref$popupPosition,
    _ref$popupStyle = _ref.popupStyle,
    popupStyle = _ref$popupStyle === void 0 ? null : _ref$popupStyle,
    _ref$overlayStyle = _ref.overlayStyle,
    overlayStyle = _ref$overlayStyle === void 0 ? null : _ref$overlayStyle;
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    numPages = _useState2[0],
    setNumPages = _useState2[1];
  var _useState3 = useState(1),
    _useState4 = _slicedToArray(_useState3, 2),
    currentPage = _useState4[0],
    setCurrentPage = _useState4[1];
  var _useState5 = useState(1),
    _useState6 = _slicedToArray(_useState5, 2),
    scale = _useState6[0],
    setScale = _useState6[1];
  var _useState7 = useState(false),
    _useState8 = _slicedToArray(_useState7, 2),
    drawing = _useState8[0],
    setDrawing = _useState8[1];
  var _useState9 = useState(null),
    _useState0 = _slicedToArray(_useState9, 2),
    box = _useState0[0],
    setBox = _useState0[1];
  var _useState1 = useState(null),
    _useState10 = _slicedToArray(_useState1, 2),
    confirmedCoords = _useState10[0],
    setConfirmedCoords = _useState10[1];
  var _useState11 = useState(null),
    _useState12 = _slicedToArray(_useState11, 2),
    pdfDimensions = _useState12[0],
    setPdfDimensions = _useState12[1];
  var _useState13 = useState(null),
    _useState14 = _slicedToArray(_useState13, 2),
    canvasSize = _useState14[0],
    setCanvasSize = _useState14[1];
  var _useState15 = useState(null),
    _useState16 = _slicedToArray(_useState15, 2),
    resolvedSource = _useState16[0],
    setResolvedSource = _useState16[1];
  var _useState17 = useState(false),
    _useState18 = _slicedToArray(_useState17, 2),
    signing = _useState18[0],
    setSigning = _useState18[1];
  var _useState19 = useState(null),
    _useState20 = _slicedToArray(_useState19, 2),
    signResult = _useState20[0],
    setSignResult = _useState20[1];
  var _useState21 = useState(null),
    _useState22 = _slicedToArray(_useState21, 2),
    signedPdf = _useState22[0],
    setSignedPdf = _useState22[1];

  // ── Responsive tracking ────────────────────────────────────────────────────
  var _useState23 = useState(typeof window !== 'undefined' ? window.innerWidth : 1024),
    _useState24 = _slicedToArray(_useState23, 2),
    viewportWidth = _useState24[0],
    setViewportWidth = _useState24[1];
  var isMobile = viewportWidth <= MOBILE_BREAKPOINT;
  var wrapperRef = useRef(null); // outer scroll area we measure for auto PDF width on mobile
  var containerRef = useRef(null);
  var startPos = useRef(null);
  useEffect(function () {
    function onResize() {
      setViewportWidth(window.innerWidth);
    }
    window.addEventListener('resize', onResize);
    return function () {
      return window.removeEventListener('resize', onResize);
    };
  }, []);

  // Effective render width for the PDF page: on mobile, fit the wrapper
  // (minus padding) instead of using the fixed desktop `width` prop.
  var _useState25 = useState(null),
    _useState26 = _slicedToArray(_useState25, 2),
    autoWidth = _useState26[0],
    setAutoWidth = _useState26[1];
  useEffect(function () {
    if (!isMobile) {
      setAutoWidth(null);
      return;
    }
    function measure() {
      var _wrapperRef$current;
      var w = (_wrapperRef$current = wrapperRef.current) === null || _wrapperRef$current === void 0 ? void 0 : _wrapperRef$current.offsetWidth;
      if (w) setAutoWidth(Math.max(240, w - 24)); // 24 = left+right padding
    }
    measure();
    window.addEventListener('resize', measure);
    return function () {
      return window.removeEventListener('resize', measure);
    };
  }, [isMobile]);
  var effectiveWidth = isMobile ? autoWidth || viewportWidth - 24 : width;

  // ── Resolve source ────────────────────────────────────────────────────────
  useEffect(function () {
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
      width: page.originalWidth || page.width,
      height: page.originalHeight || page.height
    });
    setTimeout(function () {
      var _containerRef$current;
      var canvas = (_containerRef$current = containerRef.current) === null || _containerRef$current === void 0 ? void 0 : _containerRef$current.querySelector('canvas');
      if (canvas) setCanvasSize({
        width: canvas.offsetWidth,
        height: canvas.offsetHeight
      });
    }, 150);
  }
  function onRenderSuccess() {
    setTimeout(function () {
      var _containerRef$current2;
      var canvas = (_containerRef$current2 = containerRef.current) === null || _containerRef$current2 === void 0 ? void 0 : _containerRef$current2.querySelector('canvas');
      if (canvas) setCanvasSize({
        width: canvas.offsetWidth,
        height: canvas.offsetHeight
      });
    }, 100);
  }

  // ── Shared position helper (mouse + touch) ───────────────────────────────
  function getPosFromClientCoords(clientX, clientY) {
    var rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, clientX - rect.left),
      y: Math.max(0, clientY - rect.top)
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
    var pos = getPosFromClientCoords(clientX, clientY);
    setBox({
      x: Math.min(startPos.current.x, pos.x),
      y: Math.min(startPos.current.y, pos.y),
      w: Math.abs(pos.x - startPos.current.x),
      h: Math.abs(pos.y - startPos.current.y)
    });
  }
  function endDraw() {
    setDrawing(false);
    if (box && box.w > 5 && canvasSize && pdfDimensions) {
      var scaleX = pdfDimensions.width / canvasSize.width;
      var scaleY = pdfDimensions.height / canvasSize.height;
      var x1 = Math.round(box.x * scaleX);
      var x2 = Math.round((box.x + box.w) * scaleX);
      var y1 = Math.round(pdfDimensions.height - (box.y + box.h) * scaleY);
      var y2 = Math.round(pdfDimensions.height - box.y * scaleY);
      var coords = "".concat(x1, ",").concat(y1, ",").concat(x2, ",").concat(y2);
      setConfirmedCoords(coords);
      if (onCoordinateSelect) onCoordinateSelect(coords);
    }
  }

  // ── Mouse handlers (desktop) ─────────────────────────────────────────────
  function onMouseDown(e) {
    e.preventDefault();
    beginDraw(e.clientX, e.clientY);
  }
  function onMouseMove(e) {
    updateDraw(e.clientX, e.clientY);
  }
  function onMouseUp() {
    endDraw();
  }

  // ── Touch handlers (mobile) ──────────────────────────────────────────────
  // preventDefault stops the page from scrolling while the user is drawing a box.
  function onTouchStart(e) {
    if (!showCoordinatePicker) return;
    var t = e.touches[0];
    if (!t) return;
    e.preventDefault();
    beginDraw(t.clientX, t.clientY);
  }
  function onTouchMove(e) {
    if (!drawing) return;
    var t = e.touches[0];
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
  function handleSign() {
    return _handleSign.apply(this, arguments);
  } // ── Render content ────────────────────────────────────────────────────────
  function _handleSign() {
    _handleSign = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var _value, _value2, _value3, connections, ws, value, effectiveInputType, res, input, base64Pdf, _parsed$message, parsed, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            if (confirmedCoords) {
              _context.n = 1;
              break;
            }
            setSignResult({
              type: 'error',
              message: 'Draw a box first to set coordinates.'
            });
            return _context.a(2);
          case 1:
            setSigning(true);
            setSignResult(null);
            _context.p = 2;
            _context.n = 3;
            return createClient();
          case 3:
            connections = _context.v;
            ws = getConnection(connections, signer);
            value = pdfInputValue;
            if (!value) {
              value = pdfSource !== null && pdfSource !== void 0 && pdfSource.startsWith('data:') ? pdfSource.split(',')[1] : pdfSource;
            }

            // Auto-detect the correct dSigner inputType from the value itself,
            // instead of trusting a possibly-stale inputType prop.
            effectiveInputType = inputType;
            if ((_value = value) !== null && _value !== void 0 && _value.startsWith('http://') || (_value2 = value) !== null && _value2 !== void 0 && _value2.startsWith('https://')) {
              effectiveInputType = 2;
            } else if ((_value3 = value) !== null && _value3 !== void 0 && _value3.startsWith('/') || /^[a-zA-Z]:\\/.test(value || '')) {
              effectiveInputType = 1;
            } else if (inputType !== 4) {
              effectiveInputType = 0;
            }
            if (!(signer === 'emsigner')) {
              _context.n = 6;
              break;
            }
            _context.n = 4;
            return emsignerSignPdf(ws, {
              tbs: value,
              outputPath: outputPath || '',
              coordinate: confirmedCoords,
              pageno: 'all',
              location: location
            });
          case 4:
            res = _context.v;
            if (!(!res || typeof res === 'string' && res.trim() === '')) {
              _context.n = 5;
              break;
            }
            throw new Error('eMsigner returned an empty response — is the eMsigner app running?');
          case 5:
            _context.n = 8;
            break;
          case 6:
            input = effectiveInputType === 4 ? "{4,{\"".concat(value, "\",\"\"}}") : "{".concat(effectiveInputType, ",\"").concat(value, "\"}");
            _context.n = 7;
            return signPdf(ws, {
              input: input,
              signPage: 'all',
              coordinates: confirmedCoords,
              location: location,
              textStamp: 0,
              lastPage: 0,
              outputPath: outputPath || null
            });
          case 7:
            res = _context.v;
          case 8:
            base64Pdf = null;
            try {
              parsed = typeof res === 'string' ? JSON.parse(res) : res;
              if (parsed !== null && parsed !== void 0 && (_parsed$message = parsed.message) !== null && _parsed$message !== void 0 && _parsed$message.startsWith('JVBER')) base64Pdf = parsed.message;
            } catch (_unused) {
              if (typeof res === 'string' && res.trim().startsWith('JVBER')) base64Pdf = res.trim();
            }
            if (base64Pdf) setSignedPdf("data:application/pdf;base64,".concat(base64Pdf));
            setSignResult({
              type: 'success',
              message: outputPath ? "\u2713 Signed! Saved to: ".concat(outputPath) : '✓ Signed successfully!'
            });
            if (onSigned) onSigned({
              status: 'success',
              raw: res,
              base64: base64Pdf
            });
            _context.n = 10;
            break;
          case 9:
            _context.p = 9;
            _t = _context.v;
            setSignResult({
              type: 'error',
              message: '✗ ' + _t.message
            });
            if (onSigned) onSigned({
              status: 'error',
              error: _t.message
            });
          case 10:
            _context.p = 10;
            setSigning(false);
            return _context.f(10);
          case 11:
            return _context.a(2);
        }
      }, _callee, null, [[2, 9, 10, 11]]);
    }));
    return _handleSign.apply(this, arguments);
  }
  var renderContent = function renderContent() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#f0efe9'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '8px 10px' : '10px 16px',
        background: '#fff',
        borderBottom: '1px solid #e0ddd5',
        flexShrink: 0,
        gap: isMobile ? 6 : 12,
        rowGap: isMobile ? 8 : 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 4 : 8,
        fontSize: isMobile ? 12 : 13,
        order: 1
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: navBtn(isMobile),
      onClick: function onClick() {
        setCurrentPage(function (p) {
          return Math.max(1, p - 1);
        });
        setBox(null);
      },
      disabled: currentPage === 1
    }, "\u2190"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#555',
        minWidth: isMobile ? 44 : 60,
        textAlign: 'center'
      }
    }, numPages ? "".concat(currentPage, "/").concat(numPages) : '...'), /*#__PURE__*/React.createElement("button", {
      style: navBtn(isMobile),
      onClick: function onClick() {
        setCurrentPage(function (p) {
          return Math.min(numPages || 1, p + 1);
        });
        setBox(null);
      },
      disabled: currentPage === numPages
    }, "\u2192")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 4 : 8,
        order: isMobile ? 3 : 2,
        width: isMobile ? '100%' : 'auto',
        justifyContent: isMobile ? 'center' : 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: navBtn(isMobile),
      onClick: function onClick() {
        return setScale(function (s) {
          return Math.max(0.5, +(s - 0.25).toFixed(2));
        });
      }
    }, "\u2212"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: isMobile ? 12 : 13,
        color: '#555',
        minWidth: isMobile ? 38 : 45,
        textAlign: 'center'
      }
    }, Math.round(scale * 100), "%"), /*#__PURE__*/React.createElement("button", {
      style: navBtn(isMobile),
      onClick: function onClick() {
        return setScale(function (s) {
          return Math.min(3, +(s + 0.25).toFixed(2));
        });
      }
    }, "+"), !isMobile && /*#__PURE__*/React.createElement("button", {
      style: _objectSpread2(_objectSpread2({}, navBtn(isMobile)), {}, {
        fontSize: 11
      }),
      onClick: function onClick() {
        return setScale(1);
      }
    }, "Reset")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 6 : 8,
        order: isMobile ? 2 : 3,
        flexWrap: 'wrap'
      }
    }, showCoordinatePicker && !confirmedCoords && !isMobile && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: '#2563eb'
      }
    }, "\uD83D\uDCD0 Draw box to pick coordinates"), showCoordinatePicker && !confirmedCoords && isMobile && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: '#2563eb'
      }
    }, "\uD83D\uDCD0 Drag to pick"), confirmedCoords && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: isMobile ? 10 : 11,
        fontFamily: 'monospace',
        background: '#f0fff4',
        color: '#1a7a3a',
        padding: isMobile ? '2px 6px' : '3px 8px',
        borderRadius: 5,
        whiteSpace: 'nowrap'
      }
    }, confirmedCoords), enableSigning && confirmedCoords && /*#__PURE__*/React.createElement("button", {
      style: _objectSpread2(_objectSpread2({}, navBtn(isMobile)), {}, {
        background: signing ? '#888' : '#1a1a1a',
        color: '#fff',
        border: 'none',
        cursor: signing ? 'not-allowed' : 'pointer'
      }),
      onClick: handleSign,
      disabled: signing
    }, signing ? 'Signing...' : '✍️ Sign'), !inline && onClose && /*#__PURE__*/React.createElement("button", {
      style: _objectSpread2(_objectSpread2({}, navBtn(isMobile)), {}, {
        padding: isMobile ? '5px 8px' : '4px 10px'
      }),
      onClick: onClose
    }, "\u2715"))), signResult && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: isMobile ? '6px 10px' : '6px 16px',
        fontSize: isMobile ? 10 : 11,
        fontFamily: 'monospace',
        background: signResult.type === 'success' ? '#f0fff4' : '#fff0f0',
        color: signResult.type === 'success' ? '#1a7a3a' : '#d04040',
        borderBottom: '1px solid #e0ddd5',
        flexShrink: 0,
        wordBreak: 'break-word'
      }
    }, signResult.message), /*#__PURE__*/React.createElement("div", {
      ref: wrapperRef,
      style: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: isMobile ? 12 : 24,
        WebkitOverflowScrolling: 'touch'
      }
    }, !resolvedSource ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: '#bbb',
        paddingTop: isMobile ? 40 : 80
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: isMobile ? 36 : 48,
        marginBottom: 12
      }
    }, "\uD83D\uDCC4"), pdfSource ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: isMobile ? 13 : 14,
        padding: '0 16px'
      }
    }, "Local file paths cannot be previewed in browser"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: isMobile ? 11 : 12,
        marginTop: 6,
        color: '#ccc'
      }
    }, "Use base64 or a URL instead")) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: isMobile ? 13 : 14
      }
    }, "No PDF provided")) : /*#__PURE__*/React.createElement("div", {
      ref: containerRef,
      style: {
        position: 'relative',
        display: 'inline-block',
        cursor: showCoordinatePicker ? 'crosshair' : 'default',
        userSelect: 'none',
        touchAction: showCoordinatePicker ? 'none' : 'auto',
        // 'none' lets us drive drawing ourselves instead of the browser scrolling
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        transform: "scale(".concat(scale, ")"),
        transformOrigin: 'top center'
      },
      onMouseDown: onMouseDown,
      onMouseMove: onMouseMove,
      onMouseUp: onMouseUp,
      onMouseLeave: function onMouseLeave() {
        return drawing && endDraw();
      },
      onTouchStart: onTouchStart,
      onTouchMove: onTouchMove,
      onTouchEnd: onTouchEnd,
      onTouchCancel: onTouchEnd
    }, /*#__PURE__*/React.createElement(Document, {
      file: signedPdf || resolvedSource,
      onLoadSuccess: function onLoadSuccess(_ref2) {
        var numPages = _ref2.numPages;
        setNumPages(numPages);
        setCurrentPage(1);
      },
      style: {
        display: 'block'
      }
    }, /*#__PURE__*/React.createElement(Page, {
      pageNumber: currentPage,
      width: effectiveWidth,
      onLoadSuccess: onPageLoadSuccess,
      onRenderSuccess: onRenderSuccess
    })), box && !signedPdf && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        border: '2px solid #e74c3c',
        background: 'rgba(231,76,60,0.15)',
        pointerEvents: 'none',
        boxSizing: 'border-box'
      }
    }), confirmedCoords && box && !signedPdf && /*#__PURE__*/React.createElement("div", {
      style: {
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
        whiteSpace: 'nowrap'
      }
    }, confirmedCoords))));
  };

  // ── Inline mode ───────────────────────────────────────────────────────────
  // Fills whatever container the developer places it in. Developer controls
  // position on the page by wrapping it in their own positioned <div>.
  if (inline) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: height,
        overflow: 'hidden',
        borderRadius: 10,
        border: '1px solid #ece9e2'
      }
    }, renderContent());
  }

  // ── Popup modal mode (default) ────────────────────────────────────────────
  // Desktop: honors popupPosition preset + popupStyle/overlayStyle overrides.
  // Mobile: always full-screen regardless of popupPosition — a 420px corner
  // popup doesn't fit a phone screen, so we force the 'center' full-screen
  // layout and ignore popupStyle/overlayStyle overrides there too.
  var preset = isMobile ? POSITION_PRESETS.center : POSITION_PRESETS[popupPosition] || POSITION_PRESETS.center;
  return /*#__PURE__*/React.createElement("div", {
    style: _objectSpread2(_objectSpread2({
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }, preset.overlay), isMobile ? null : overlayStyle)
  }, /*#__PURE__*/React.createElement("div", {
    style: _objectSpread2(_objectSpread2({
      width: isMobile ? '100vw' : '95vw',
      height: isMobile ? '100vh' : '92vh',
      background: '#fff',
      borderRadius: isMobile ? 0 : 14,
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      display: 'flex',
      flexDirection: 'column'
    }, preset.popup), isMobile ? {
      width: '100vw',
      height: '100vh',
      margin: 0,
      borderRadius: 0
    } : popupStyle)
  }, renderContent()));
}

// ── Styles ────────────────────────────────────────────────────────────────────
var navBtn = function navBtn(isMobile) {
  return {
    padding: isMobile ? '6px 9px' : '5px 10px',
    borderRadius: 6,
    border: '1px solid #ddd',
    background: '#fff',
    fontSize: isMobile ? 12 : 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    minHeight: isMobile ? 32 : 'auto' // touch target size
  };
};

export { CoordinatePicker, DsignerWidget, PdfViewer, createClient, emsignerSignData, emsignerSignPdf, getConnection, signForm, signPdf, sign as signPdfHeadless };
