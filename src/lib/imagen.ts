const STYLE_PROMPTS = [
  "serene mountain landscape at golden hour with soft clouds, dreamy atmosphere, muted colors",
  "peaceful forest path with morning mist, soft sunlight filtering through trees, ethereal mood",
  "calm ocean waves at sunset with pastel sky colors, minimalist composition",
  "gentle rolling hills with wildflowers, soft focus background, warm lighting",
  "tranquil lake reflection at dawn, misty mountains in distance, peaceful atmosphere",
  "autumn forest with golden leaves, soft bokeh effect, warm tones",
  "desert sand dunes at sunrise, soft shadows, minimalist and serene",
  "cherry blossom trees in soft focus, gentle pink tones, dreamy spring day",
  "northern lights over snowy landscape, soft purple and green hues",
  "meadow with morning dew, soft sunlight, peaceful and calming"
];

export interface GenerateImageResult {
  imageBase64: string;
  promptUsed: string;
}

export async function generateImageWithText(quoteText: string, author: string): Promise<GenerateImageResult> {
  const stylePrompt = STYLE_PROMPTS[Math.floor(Math.random() * STYLE_PROMPTS.length)];
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // Build the full prompt with the quote text embedded
  const fullPrompt = `Create a beautiful inspirational quote image for Instagram.

BACKGROUND: ${stylePrompt}

TEXT TO DISPLAY (must be rendered exactly as written, centered on the image):
"${quoteText}"
— ${author}

REQUIREMENTS:
- The quote text must be large, bold, and clearly legible
- Use an elegant serif or sans-serif font in white or cream color
- Add a subtle dark gradient or shadow behind the text for readability
- The quote should be centered both horizontally and vertically
- The author name should be smaller, below the quote
- Aspect ratio should be suitable for Instagram (4:5 or 1:1)
- The background should be soft and not distract from the text
- Make the text the focal point of the image`;

  console.log('=== GEMINI 3 PRO IMAGE PROMPT ===');
  console.log(fullPrompt);
  console.log('=================================');

  // Use Gemini 3 Pro Preview (Nano Banana Pro) for image generation with text
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: fullPrompt }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: "3:4"
          }
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini 3 Pro API error:', errorText);
    throw new Error(`Gemini 3 Pro API failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Gemini 3 Pro response:', JSON.stringify(data, null, 2));

  // Extract the image from the response
  if (data.candidates && data.candidates.length > 0) {
    const parts = data.candidates[0].content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
        return {
          imageBase64: part.inlineData.data,
          promptUsed: fullPrompt
        };
      }
    }
  }

  throw new Error('No image generated in response');
}
