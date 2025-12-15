import sharp from 'sharp';

const WIDTH = 1080;
const HEIGHT = 1350;

export async function createQuoteImage(
  backgroundBase64: string,
  quoteText: string,
  author: string
): Promise<Buffer> {
  // Decode base64 background
  const backgroundBuffer = Buffer.from(backgroundBase64, 'base64');

  // Resize background to target dimensions
  const background = await sharp(backgroundBuffer)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .toBuffer();

  // Create text overlay SVG
  const svg = createTextOverlaySvg(quoteText, author);

  // Composite text over background
  const result = await sharp(background)
    .composite([
      {
        input: Buffer.from(svg),
        top: 0,
        left: 0,
      }
    ])
    .jpeg({ quality: 90 })
    .toBuffer();

  return result;
}

function createTextOverlaySvg(quote: string, author: string): string {
  const wrappedQuote = wrapText(quote, 28);
  const lines = wrappedQuote.split('\n');
  const lineHeight = 72;
  const totalTextHeight = lines.length * lineHeight + 100; // +100 for author
  const startY = (HEIGHT - totalTextHeight) / 2 + 50;

  const quoteLines = lines.map((line, i) => {
    const y = startY + (i * lineHeight);
    return `<text x="540" y="${y}" text-anchor="middle"
      font-family="Georgia, serif" font-size="54" font-style="italic"
      fill="white" filter="url(#shadow)">"${i === 0 ? '' : ''}${line}${i === lines.length - 1 ? '' : ''}"</text>`;
  }).join('\n');

  const authorY = startY + (lines.length * lineHeight) + 60;

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="4" flood-color="black" flood-opacity="0.7"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.3)"/>
      ${quoteLines}
      <text x="540" y="${authorY}" text-anchor="middle"
        font-family="Georgia, serif" font-size="36"
        fill="white" filter="url(#shadow)">— ${author}</text>
    </svg>
  `;
}

function wrapText(text: string, maxCharsPerLine: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines.join('\n');
}
