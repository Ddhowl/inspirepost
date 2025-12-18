import { NextResponse } from 'next/server';
import { fetchRandomQuote } from '@/lib/quotes';
import { generateBackgroundImage } from '@/lib/imagen';
import sharp from 'sharp';

const WIDTH = 1080;
const HEIGHT = 1350;

export async function POST() {
  try {
    // 1. Fetch a random quote
    const quote = await fetchRandomQuote();

    // 2. Generate background image
    const backgroundBase64 = await generateBackgroundImage();

    // 3. Resize background to target dimensions (no text overlay - browser will do that)
    const backgroundBuffer = Buffer.from(backgroundBase64, 'base64');
    const resizedBackground = await sharp(backgroundBuffer)
      .resize(WIDTH, HEIGHT, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer();

    // 4. Return the background image as base64 + quote data
    const imageBase64 = resizedBackground.toString('base64');

    return NextResponse.json({
      success: true,
      image: imageBase64,
      quote: {
        text: quote.text,
        author: quote.author,
        source: quote.source
      }
    });
  } catch (error) {
    console.error('Generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to generate image: ${errorMessage}` },
      { status: 500 }
    );
  }
}
