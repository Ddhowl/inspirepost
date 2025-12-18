import { NextRequest, NextResponse } from 'next/server';
import {
  getContentById,
  updateContentStatus,
  deleteContent,
  ContentStatus
} from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/content/[id] - Get single content item
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const item = await getContentById(id);

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item
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

// PATCH /api/content/[id] - Update content item (status, scheduled date, etc.)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if item exists
    const existing = await getContentById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    // Validate status if provided
    const validStatuses: ContentStatus[] = ['pending', 'approved', 'rejected', 'published', 'failed'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Build update fields
    const updates: Record<string, unknown> = {};

    if (body.scheduled_date !== undefined) updates.scheduled_date = body.scheduled_date;
    if (body.scheduled_time !== undefined) updates.scheduled_time = body.scheduled_time;
    if (body.caption !== undefined) updates.caption = body.caption;
    if (body.hashtags !== undefined) updates.hashtags = body.hashtags;
    if (body.error_message !== undefined) updates.error_message = body.error_message;
    if (body.instagram_post_id !== undefined) updates.instagram_post_id = body.instagram_post_id;

    const item = await updateContentStatus(
      id,
      body.status || existing.status,
      updates
    );

    return NextResponse.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Error updating content:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/content/[id] - Delete content item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if item exists
    const existing = await getContentById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    await deleteContent(id);

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
