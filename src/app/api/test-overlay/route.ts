import { NextResponse } from 'next/server';
import sharp from 'sharp';

const WIDTH = 1080;
const HEIGHT = 1350;

// Test endpoint - uses solid color background instead of Imagen API
// Cost: $0
export async function GET() {
  try {
    // Create a gradient-like background (no API call needed)
    const background = await sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 3,
        background: { r: 60, g: 100, b: 140 }
      }
    }).jpeg().toBuffer();

    // Test quote
    const quote = "The only way to do great work is to love what you do.";
    const author = "Steve Jobs";

    // Create text overlay SVG
    const svg = createTextOverlaySvg(quote, author);

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

    // Return image directly
    return new NextResponse(new Uint8Array(result), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Test overlay error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function createTextOverlaySvg(quote: string, author: string): string {
  const lines = wrapText(quote, 25);
  const lineHeight = 80;
  const totalTextHeight = lines.length * lineHeight + 120;
  const startY = (HEIGHT - totalTextHeight) / 2 + 80;

  const quoteLines = lines.map((line, i) => {
    const y = startY + (i * lineHeight);
    const displayLine = i === 0 ? `"${line}` : (i === lines.length - 1 ? `${line}"` : line);
    // Using DejaVu fonts which are available on Linux/Vercel
    return `<text x="540" y="${y}" text-anchor="middle" font-family="DejaVu Serif, Liberation Serif, Times New Roman, serif" font-size="64" font-style="italic" fill="white" stroke="black" stroke-width="3">${escapeXml(displayLine)}</text>`;
  }).join('\n');

  const authorY = startY + (lines.length * lineHeight) + 60;

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="rgba(0,0,0,0.4)"/>
    ${quoteLines}
    <text x="540" y="${authorY}" text-anchor="middle" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="40" fill="white" stroke="black" stroke-width="2">— ${escapeXml(author)}</text>
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
