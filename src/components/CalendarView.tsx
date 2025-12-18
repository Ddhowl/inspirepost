'use client';

import { useState, useEffect, useCallback } from 'react';
import ContentCard, { ContentItem } from './ContentCard';

interface QueueStats {
  total: number;
  pending: number;
  approved: number;
  needsGeneration: number;
}

export default function CalendarView() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [generating, setGenerating] = useState(false);
  const [filling, setFilling] = useState(false);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/content');
      const data = await response.json();

      if (data.success) {
        setItems(data.items);
      } else {
        setError(data.error || 'Failed to fetch content');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQueueStats = useCallback(async () => {
    try {
      const response = await fetch('/api/queue');
      const data = await response.json();
      if (data.success) {
        setQueueStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch queue stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchContent();
    fetchQueueStats();
  }, [fetchContent, fetchQueueStats]);

  const handleFillQueue = async () => {
    setFilling(true);
    setError(null);

    try {
      const response = await fetch('/api/queue?action=fill', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        await fetchContent();
        await fetchQueueStats();
      } else {
        setError(data.error || 'Failed to fill queue');
      }
    } catch (err) {
      setError('Failed to fill queue');
      console.error(err);
    } finally {
      setFilling(false);
    }
  };

  const handleApprove = async (id: string) => {
    const response = await fetch(`/api/content/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });

    if (response.ok) {
      await fetchContent();
    }
  };

  const handleReject = async (id: string) => {
    const response = await fetch(`/api/content/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    });

    if (response.ok) {
      await fetchContent();
    }
  };

  const handleRegenerate = async (id: string) => {
    // Delete the old item
    await fetch(`/api/content/${id}`, { method: 'DELETE' });

    // Generate a new one
    setGenerating(true);
    try {
      const response = await fetch('/api/generate?save=true', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        await fetchContent();
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    const response = await fetch(`/api/content/${id}`, { method: 'DELETE' });

    if (response.ok) {
      await fetchContent();
    }
  };

  const handleGenerateNew = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate?save=true', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        await fetchContent();
      } else {
        setError(data.error || 'Failed to generate content');
      }
    } catch (err) {
      setError('Failed to generate content');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const stats = {
    total: items.length,
    pending: items.filter((i) => i.status === 'pending').length,
    approved: items.filter((i) => i.status === 'approved').length,
    rejected: items.filter((i) => i.status === 'rejected').length,
    published: items.filter((i) => i.status === 'published').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading content...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with stats and actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGenerateNew}
            disabled={generating || filling}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            {generating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Generate One
              </>
            )}
          </button>

          {queueStats && queueStats.needsGeneration > 0 && (
            <button
              onClick={handleFillQueue}
              disabled={generating || filling}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              {filling ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Filling Queue...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Fill Queue ({queueStats.needsGeneration})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg px-4 py-3 text-red-200 mb-6">
          {error}
        </div>
      )}

      {/* Content grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-500 mb-4">
            {filter === 'all'
              ? 'No content yet. Generate your first quote image!'
              : `No ${filter} content found.`}
          </div>
          {filter === 'all' && (
            <button
              onClick={handleGenerateNew}
              disabled={generating}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 rounded-lg font-medium transition-all"
            >
              {generating ? 'Generating...' : 'Generate First Quote'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
              onRegenerate={handleRegenerate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
