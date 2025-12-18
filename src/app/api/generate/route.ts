import { NextResponse } from 'next/server';
import { fetchRandomQuote } from '@/lib/quotes';
import { generateImageWithText } from '@/lib/imagen';
import sharp from 'sharp';

const WIDTH = 1080;
const HEIGHT = 1350;

export async function POST() {
  try {
    // 1. Fetch a random quote
    const quote = await fetchRandomQuote();
    console.log('Quote fetched:', quote.text, '-', quote.author);

    // 2. Generate image with text embedded using Gemini 3 Pro (Nano Banana Pro)
    const { imageBase64, promptUsed } = await generateImageWithText(quote.text, quote.author);

    // 3. Resize to Instagram dimensions
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const resizedImage = await sharp(imageBuffer)
      .resize(WIDTH, HEIGHT, { fit: 'cover' })
      .jpeg({ quality: 95 })
      .toBuffer();

    // 4. Return the final image with prompt info
    const finalImageBase64 = resizedImage.toString('base64');

    return NextResponse.json({
      success: true,
      image: finalImageBase64,
      quote: {
        text: quote.text,
        author: quote.author,
        source: quote.source
      },
      promptUsed: promptUsed  // Include the prompt so user can see what was sent
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
