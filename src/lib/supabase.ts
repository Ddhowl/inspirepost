import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role key (full access)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types for content items
export type ContentStatus = 'pending' | 'approved' | 'rejected' | 'published' | 'failed';
export type ContentSource = 'curated' | 'ai_generated';

export interface ContentItem {
  id: string;
  quote: string;
  author: string | null;
  source: ContentSource;
  image_url: string | null;
  image_base64: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  status: ContentStatus;
  instagram_post_id: string | null;
  caption: string | null;
  hashtags: string[] | null;
  prompt_used: string | null;
  created_at: string;
  approved_at: string | null;
  published_at: string | null;
  error_message: string | null;
}

export interface CreateContentInput {
  quote: string;
  author: string | null;
  source: ContentSource;
  image_base64: string;
  scheduled_date?: string;
  scheduled_time?: string;
  prompt_used?: string;
}

// Helper functions for content operations
export async function createContent(input: CreateContentInput): Promise<ContentItem> {
  const { data, error } = await supabase
    .from('content_items')
    .insert({
      quote: input.quote,
      author: input.author,
      source: input.source,
      image_base64: input.image_base64,
      scheduled_date: input.scheduled_date || null,
      scheduled_time: input.scheduled_time || null,
      prompt_used: input.prompt_used || null,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getContentItems(status?: ContentStatus): Promise<ContentItem[]> {
  let query = supabase
    .from('content_items')
    .select('*')
    .order('scheduled_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(error.message);
  }
  return data;
}

export async function updateContentStatus(
  id: string,
  status: ContentStatus,
  additionalFields?: Partial<ContentItem>
): Promise<ContentItem> {
  const updates: Partial<ContentItem> = {
    status,
    ...additionalFields
  };

  // Set timestamp fields based on status
  if (status === 'approved') {
    updates.approved_at = new Date().toISOString();
  } else if (status === 'published') {
    updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('content_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteContent(id: string): Promise<void> {
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getPendingContentCount(): Promise<number> {
  const { count, error } = await supabase
    .from('content_items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) throw new Error(error.message);
  return count || 0;
}

export async function getUpcomingContent(days: number = 7): Promise<ContentItem[]> {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .gte('scheduled_date', today.toISOString().split('T')[0])
    .lte('scheduled_date', futureDate.toISOString().split('T')[0])
    .in('status', ['pending', 'approved'])
    .order('scheduled_date', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}
