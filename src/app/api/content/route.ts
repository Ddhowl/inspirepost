import { NextRequest, NextResponse } from 'next/server';
import {
  createContent,
  getContentItems,
  getUpcomingContent,
  ContentStatus,
  CreateContentInput
} from '@/lib/supabase';

// GET /api/content - List content items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as ContentStatus | null;
    const upcoming = searchParams.get('upcoming');
    const days = parseInt(searchParams.get('days') || '7');

    let items;

    if (upcoming === 'true') {
      // Get upcoming 7 days of content
      items = await getUpcomingContent(days);
    } else {
      // Get all content, optionally filtered by status
      items = await getContentItems(status || undefined);
    }

    return NextResponse.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/content - Create new content item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.quote || !body.source || !body.image_base64) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: quote, source, image_base64' },
        { status: 400 }
      );
    }

    // Validate source
    if (!['curated', 'ai_generated'].includes(body.source)) {
      return NextResponse.json(
        { success: false, error: 'Invalid source. Must be "curated" or "ai_generated"' },
        { status: 400 }
      );
    }

    const input: CreateContentInput = {
      quote: body.quote,
      author: body.author || null,
      source: body.source,
      image_base64: body.image_base64,
      scheduled_date: body.scheduled_date,
      scheduled_time: body.scheduled_time,
      prompt_used: body.prompt_used
    };

    const item = await createContent(input);

    return NextResponse.json({
      success: true,
      item
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
