// Script to create content_items table in Supabase using direct PostgreSQL connection
const { Client } = require('pg');
require('dotenv').config();

const projectRef = 'xinleyjwfnjtvqeexfzb';
const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error('Missing SUPABASE_DB_PASSWORD in .env');
  process.exit(1);
}

// Supabase database connection string (direct connection)
const connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;

const createTableSQL = `
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
`;

async function createTables() {
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected!');

    console.log('Creating content_items table...');
    await client.query(createTableSQL);
    console.log('✅ Table created successfully!');

    // Verify by checking if table exists
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'content_items'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Verified: content_items table exists');
    }

  } catch (error) {
    console.error('Error:', error.message);

    // Try alternate connection string format
    if (error.message.includes('connection')) {
      console.log('\nTrying alternate connection...');
      const altConnectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;
      const altClient = new Client({ connectionString: altConnectionString });

      try {
        await altClient.connect();
        console.log('Connected with alternate string!');
        await altClient.query(createTableSQL);
        console.log('✅ Table created successfully!');
        await altClient.end();
      } catch (altError) {
        console.error('Alternate connection also failed:', altError.message);
      }
    }
  } finally {
    await client.end();
  }
}

createTables();
