// Test Supabase connection and check if table exists
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);

  // Try to query the content_items table
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error:', error.message);
    console.log('\nTable does not exist yet. Please run this SQL in Supabase Dashboard:');
    console.log('Go to: https://supabase.com/dashboard/project/xinleyjwfnjtvqeexfzb/sql/new');
    console.log('\n--- COPY SQL BELOW ---\n');
    console.log(`
-- Create content_items table for storing generated quote images
CREATE TABLE IF NOT EXISTS content_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  author TEXT,
  source TEXT NOT NULL CHECK (source IN ('curated', 'ai_generated')),
  image_url TEXT,
  image_base64 TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published', 'failed')),
  instagram_post_id TEXT,
  caption TEXT,
  hashtags TEXT[],
  prompt_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);

-- Create index on scheduled_date for queue management
CREATE INDEX IF NOT EXISTS idx_content_items_scheduled_date ON content_items(scheduled_date);
`);
    console.log('\n--- END SQL ---\n');
  } else {
    console.log('✅ Connection successful!');
    console.log('✅ content_items table exists!');
    console.log('Current rows:', data.length);
  }
}

testConnection().catch(console.error);
