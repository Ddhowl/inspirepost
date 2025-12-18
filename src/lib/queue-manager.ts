import { supabase, ContentItem, createContent } from './supabase';
import { fetchRandomQuote } from './quotes';
import { generateAIQuote } from './ai-quotes';
import { generateImageWithText } from './imagen';
import sharp from 'sharp';

const WIDTH = 1080;
const HEIGHT = 1350;
const TARGET_QUEUE_SIZE = 7;
const AI_CONTENT_RATIO = 0.4; // 40% AI-generated

interface QueueStats {
  total: number;
  pending: number;
  approved: number;
  needsGeneration: number;
}

export async function getQueueStats(): Promise<QueueStats> {
  const { data, error } = await supabase
    .from('content_items')
    .select('status')
    .in('status', ['pending', 'approved']);

  if (error) throw new Error(error.message);

  const items = data || [];
  const pending = items.filter(i => i.status === 'pending').length;
  const approved = items.filter(i => i.status === 'approved').length;
  const total = items.length;
  const needsGeneration = Math.max(0, TARGET_QUEUE_SIZE - total);

  return { total, pending, approved, needsGeneration };
}

export async function generateSingleContent(useAI: boolean = false): Promise<ContentItem> {
  let quote: string;
  let author: string | null;
  let source: 'curated' | 'ai_generated';

  if (useAI) {
    // Generate AI quote
    const aiQuote = await generateAIQuote();
    quote = aiQuote.text;
    author = null;
    source = 'ai_generated';
    console.log('Using AI-generated quote');
  } else {
    // Fetch curated quote
    const curatedQuote = await fetchRandomQuote();
    quote = curatedQuote.text;
    author = curatedQuote.author;
    source = 'curated';
    console.log('Using curated quote from', curatedQuote.source);
  }

  // Generate image with text
  const { imageBase64, promptUsed } = await generateImageWithText(quote, author || '');

  // Resize to Instagram dimensions
  const imageBuffer = Buffer.from(imageBase64, 'base64');
  const resizedImage = await sharp(imageBuffer)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toBuffer();

  const finalImageBase64 = resizedImage.toString('base64');

  // Calculate next available posting date
  const scheduledDate = await getNextAvailableDate();

  // Save to database
  const item = await createContent({
    quote,
    author,
    source,
    image_base64: finalImageBase64,
    scheduled_date: scheduledDate,
    prompt_used: promptUsed
  });

  console.log('Content generated and saved:', item.id);
  return item;
}

async function getNextAvailableDate(): Promise<string> {
  // Get all scheduled dates
  const { data } = await supabase
    .from('content_items')
    .select('scheduled_date')
    .in('status', ['pending', 'approved'])
    .not('scheduled_date', 'is', null)
    .order('scheduled_date', { ascending: false })
    .limit(1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (data && data.length > 0 && data[0].scheduled_date) {
    // Schedule for day after the last scheduled item
    const lastDate = new Date(data[0].scheduled_date);
    lastDate.setDate(lastDate.getDate() + 1);

    // But not before today
    if (lastDate < today) {
      return today.toISOString().split('T')[0];
    }
    return lastDate.toISOString().split('T')[0];
  }

  // No scheduled items, start from today
  return today.toISOString().split('T')[0];
}

export async function fillQueue(): Promise<{ generated: number; errors: number }> {
  const stats = await getQueueStats();
  console.log('Queue stats:', stats);

  if (stats.needsGeneration === 0) {
    console.log('Queue is full, no generation needed');
    return { generated: 0, errors: 0 };
  }

  console.log(`Generating ${stats.needsGeneration} items to fill queue...`);

  let generated = 0;
  let errors = 0;
  let aiCount = 0;

  // Calculate how many should be AI-generated
  const targetAI = Math.round(stats.needsGeneration * AI_CONTENT_RATIO);

  for (let i = 0; i < stats.needsGeneration; i++) {
    try {
      // Determine if this should be AI-generated
      const useAI = aiCount < targetAI && process.env.ANTHROPIC_API_KEY;

      await generateSingleContent(!!useAI);
      generated++;

      if (useAI) {
        aiCount++;
      }

      // Small delay between generations to avoid rate limits
      if (i < stats.needsGeneration - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Error generating content ${i + 1}:`, error);
      errors++;
    }
  }

  console.log(`Queue fill complete: ${generated} generated, ${errors} errors`);
  return { generated, errors };
}

export async function cleanupOldContent(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await supabase
    .from('content_items')
    .delete()
    .in('status', ['rejected', 'published'])
    .lt('created_at', cutoffDate.toISOString())
    .select();

  if (error) throw new Error(error.message);

  const deletedCount = data?.length || 0;
  console.log(`Cleaned up ${deletedCount} old content items`);
  return deletedCount;
}
