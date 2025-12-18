import { NextRequest, NextResponse } from 'next/server';
import { getQueueStats, fillQueue, generateSingleContent, cleanupOldContent } from '@/lib/queue-manager';

// GET /api/queue - Get queue stats
export async function GET() {
  try {
    const stats = await getQueueStats();

    return NextResponse.json({
      success: true,
      stats,
      targetSize: 7,
      isFull: stats.needsGeneration === 0
    });
  } catch (error) {
    console.error('Error getting queue stats:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/queue - Queue management actions
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'fill': {
        // Fill the queue to target size
        const result = await fillQueue();
        return NextResponse.json({
          success: true,
          action: 'fill',
          ...result
        });
      }

      case 'generate': {
        // Generate a single content item
        const useAI = searchParams.get('ai') === 'true';
        const item = await generateSingleContent(useAI);
        return NextResponse.json({
          success: true,
          action: 'generate',
          item
        });
      }

      case 'cleanup': {
        // Clean up old content
        const daysParam = searchParams.get('days');
        const days = daysParam ? parseInt(daysParam) : 30;
        const deleted = await cleanupOldContent(days);
        return NextResponse.json({
          success: true,
          action: 'cleanup',
          deleted
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: fill, generate, or cleanup' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Queue action error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
