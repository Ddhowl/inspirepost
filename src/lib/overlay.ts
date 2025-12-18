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
  const lines = wrapText(quote, 25);
  const lineHeight = 80;
  const totalTextHeight = lines.length * lineHeight + 120;
  const startY = (HEIGHT - totalTextHeight) / 2 + 80;

  const quoteLines = lines.map((line, i) => {
    const y = startY + (i * lineHeight);
    const displayLine = i === 0 ? `"${line}` : (i === lines.length - 1 ? `${line}"` : line);
    return `<text x="540" y="${y}" text-anchor="middle" font-family="serif" font-size="64" font-style="italic" fill="white" stroke="black" stroke-width="3">${escapeXml(displayLine)}</text>`;
  }).join('\n');

  const authorY = startY + (lines.length * lineHeight) + 60;

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="rgba(0,0,0,0.4)"/>
    ${quoteLines}
    <text x="540" y="${authorY}" text-anchor="middle" font-family="sans-serif" font-size="40" fill="white" stroke="black" stroke-width="2">— ${escapeXml(author)}</text>
  </svg>`;
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
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

  return lines;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
