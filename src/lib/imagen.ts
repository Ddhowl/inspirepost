const NATURE_PROMPTS = [
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

export async function generateBackgroundImage(): Promise<string> {
  const prompt = NATURE_PROMPTS[Math.floor(Math.random() * NATURE_PROMPTS.length)];
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const fullPrompt = `${prompt}, suitable as background for text overlay, no text or letters in image, soft and not too busy, professional photography style`;

  // Use the Gemini API REST endpoint for Imagen 4
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        instances: [{ prompt: fullPrompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "3:4"  // Closest to Instagram's 4:5, will crop in overlay
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Imagen API error:', errorText);
    throw new Error(`Imagen API failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.predictions && data.predictions.length > 0) {
    return data.predictions[0].bytesBase64Encoded;
  }

  throw new Error('No image generated');
}
