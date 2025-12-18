import Anthropic from '@anthropic-ai/sdk';

const THEMES = [
  'mindfulness and being present in the moment',
  'gratitude and appreciation for life',
  'resilience and overcoming challenges',
  'growth mindset and continuous improvement',
  'inner peace and tranquility',
  'self-love and acceptance',
  'courage and taking action',
  'hope and optimism for the future',
  'wisdom and learning from experience',
  'kindness and compassion for others'
];

export interface AIQuote {
  text: string;
  theme: string;
}

export async function generateAIQuote(): Promise<AIQuote> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const anthropic = new Anthropic({ apiKey });

  // Pick a random theme
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: `Generate a single original inspirational quote about ${theme}.

Requirements:
- Must be under 150 characters
- Should be profound yet accessible
- Do not attribute it to anyone (it's original)
- Do not use quotation marks
- Just return the quote text, nothing else
- Make it suitable for an Instagram inspirational post

Example style:
"Every sunrise is an invitation to brighten someone's day"
"The path to peace begins with a single mindful breath"

Now generate one original quote:`
      }
    ]
  });

  // Extract the text from the response
  const responseText = message.content[0].type === 'text'
    ? message.content[0].text.trim()
    : '';

  // Clean up the quote (remove quotes if present)
  let quote = responseText
    .replace(/^["']|["']$/g, '')  // Remove leading/trailing quotes
    .replace(/^"|"$/g, '')        // Remove curly quotes
    .trim();

  // Ensure it's under 150 characters
  if (quote.length > 150) {
    quote = quote.substring(0, 147) + '...';
  }

  console.log('AI Quote generated:', quote, '| Theme:', theme);

  return {
    text: quote,
    theme
  };
}

export async function generateMultipleAIQuotes(count: number): Promise<AIQuote[]> {
  const quotes: AIQuote[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const quote = await generateAIQuote();
      quotes.push(quote);
    } catch (error) {
      console.error(`Failed to generate AI quote ${i + 1}:`, error);
    }
  }

  return quotes;
}
