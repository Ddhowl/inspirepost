import { NextResponse } from 'next/server';
import { fetchRandomQuote } from '@/lib/quotes';
import { generateBackgroundImage } from '@/lib/imagen';
import { createQuoteImage } from '@/lib/overlay';

export async function POST() {
  try {
    // 1. Fetch a random quote
    const quote = await fetchRandomQuote();

    // 2. Generate background image
    const backgroundBase64 = await generateBackgroundImage();

    // 3. Create final image with text overlay
    const imageBuffer = await createQuoteImage(
      backgroundBase64,
      quote.text,
      quote.author
    );

    // 4. Return the image as base64
    const imageBase64 = imageBuffer.toString('base64');

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
    return NextResponse.json(
      { success: false, error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
