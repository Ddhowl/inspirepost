export interface Quote {
  text: string;
  author: string;
  source: 'zenquotes' | 'quotable';
}

export async function fetchRandomQuote(): Promise<Quote> {
  // Try ZenQuotes first, fall back to Quotable
  try {
    const quote = await fetchFromZenQuotes();
    if (quote) return quote;
  } catch (error) {
    console.error('ZenQuotes failed:', error);
  }

  try {
    const quote = await fetchFromQuotable();
    if (quote) return quote;
  } catch (error) {
    console.error('Quotable failed:', error);
  }

  // Fallback quote if both APIs fail
  return {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    source: 'quotable'
  };
}

async function fetchFromZenQuotes(): Promise<Quote | null> {
  const response = await fetch('https://zenquotes.io/api/random', {
    cache: 'no-store'
  });

  if (!response.ok) return null;

  const data = await response.json();
  if (!data || !data[0]) return null;

  return {
    text: data[0].q,
    author: data[0].a,
    source: 'zenquotes'
  };
}

async function fetchFromQuotable(): Promise<Quote | null> {
  const response = await fetch('https://api.quotable.io/random?tags=inspirational|motivational|wisdom', {
    cache: 'no-store'
  });

  if (!response.ok) return null;

  const data = await response.json();
  if (!data) return null;

  return {
    text: data.content,
    author: data.author,
    source: 'quotable'
  };
}
