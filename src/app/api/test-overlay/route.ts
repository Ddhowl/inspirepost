import { NextResponse } from 'next/server';
import sharp from 'sharp';

const WIDTH = 1080;
const HEIGHT = 1350;

// Test endpoint - returns just a background image
// Text will be rendered in the browser using Canvas
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
    }).jpeg({ quality: 90 }).toBuffer();

    return new NextResponse(new Uint8Array(background), {
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
