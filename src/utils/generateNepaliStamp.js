
const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

const NEPALI_MONTHS = [
  'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत्र',
];

// AD month start days in BS (approximate, for simple conversion)
// More accurate conversion needs full BS calendar table
const BS_YEAR_START = 56; // approx offset

function toNepaliNumber(num) {
  return String(num)
    .split('')
    .map(d => NEPALI_DIGITS[parseInt(d)] !== undefined ? NEPALI_DIGITS[parseInt(d)] : d)
    .join('');
}

function getNepaliDate() {
  try {
    // Try to use nepali-date-converter if available
    const NepaliDate = require('nepali-date-converter').default
      || require('nepali-date-converter');
    const nd = new NepaliDate(new Date());
    const y  = toNepaliNumber(nd.getYear());
    const m  = NEPALI_MONTHS[nd.getMonth()] || '';
    const d  = toNepaliNumber(nd.getDate());
    return `मिति: ${y} ${m} ${d} गते`;
  } catch {
    // Fallback — simple approximate conversion
    const today  = new Date();
    const bsYear = today.getFullYear() - BS_YEAR_START;
    const month  = NEPALI_MONTHS[today.getMonth()] || '';
    const day    = toNepaliNumber(today.getDate());
    return `मिति: ${toNepaliNumber(bsYear)} ${month} ${day} गते`;
  }
}

/**
 * @param {object}  options
 * @param {string}  options.name          - Person's name in Nepali (required)
 * @param {string}  options.pad           - Person's position/pad in Nepali (required)
 * @param {string}  [options.label]       - Top label (default: 'डिजिटल हस्ताक्षर गर्ने व्यक्ति')
 * @param {boolean} [options.showDate]    - Show Nepali date (default: true)
 * @param {boolean} [options.showLabel]   - Show top label (default: true)
 * @param {number}  [options.width]       - Canvas width in px (default: 320)
 * @param {number}  [options.height]      - Canvas height in px (default: 130)
 * @param {string}  [options.bgColor]     - Background color (default: '#ffffff')
 * @param {string}  [options.textColor]   - Text color (default: '#1a1a1a')
 * @param {string}  [options.borderColor] - Border color (default: '#1a1a1a')
 * @param {string}  [options.font]        - Font family (default: 'Noto Sans Devanagari, Arial, sans-serif')
 * @param {string}  [options.format]      - 'base64' | 'dataURL' (default: 'base64')
 *
 * @returns {string} base64 PNG string (or data URL if format='dataURL')
 */
export function generateNepaliStamp(options = {}) {
  if (typeof document === 'undefined') {
    throw new Error('generateNepaliStamp requires a browser environment (Canvas API).');
  }

  const {
    name,
    pad,
    label       = 'डिजिटल हस्ताक्षर गर्ने व्यक्ति',
    showDate    = true,
    showLabel   = true,
    width       = 320,
    height      = 130,
    bgColor     = '#ffffff',
    textColor   = '#1a1a1a',
    borderColor = '#1a1a1a',
    font        = '"Noto Sans Devanagari", "Arial Unicode MS", Arial, sans-serif',
    format      = 'base64',
  } = options;

  if (!name) throw new Error('generateNepaliStamp: name is required');
  if (!pad)  throw new Error('generateNepaliStamp: pad is required');

  // ── Create canvas ──────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth   = 2;
  ctx.strokeRect(2, 2, width - 4, height - 4);

  // Inner border line (decorative)
  ctx.strokeStyle = borderColor;
  ctx.lineWidth   = 0.5;
  ctx.strokeRect(6, 6, width - 12, height - 12);

  const cx = width / 2;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Calculate vertical positions based on what's shown
  const lines = [];
  if (showLabel) lines.push({ text: label,            size: 12, weight: 'normal' });
  lines.push(      { text: name,             size: 17, weight: 'bold'   });
  lines.push(      { text: pad,              size: 13, weight: 'normal' });
  if (showDate)  lines.push({ text: getNepaliDate(), size: 11, weight: 'normal' });

  const totalLines   = lines.length;
  const usableHeight = height - 20; // padding top+bottom
  const spacing      = usableHeight / (totalLines + 1);

  lines.forEach((line, i) => {
    const y = 10 + spacing * (i + 1);
    ctx.font = `${line.weight} ${line.size}px ${font}`;
    ctx.fillText(line.text, cx, y);
  });

  // ── Return ─────────────────────────────────────────────────────────────────
  const dataURL = canvas.toDataURL('image/png');
  if (format === 'dataURL') return dataURL;
  return dataURL.split(',')[1]; // base64 only
}

/**
 * generateEnglishStamp
 *
 * Same as generateNepaliStamp but for English text.
 * Useful when name/pad are in English.
 */
export function generateEnglishStamp(options = {}) {
  return generateNepaliStamp({
    label: 'Digitally Signed By',
    font:  '"DM Sans", Arial, sans-serif',
    ...options,
  });
}