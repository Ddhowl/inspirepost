'use client';

import { useState } from 'react';

export interface ContentItem {
  id: string;
  quote: string;
  author: string | null;
  source: 'curated' | 'ai_generated';
  image_base64: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'failed';
  created_at: string;
}

interface ContentCardProps {
  item: ContentItem;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onRegenerate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  approved: 'bg-green-500/20 text-green-300 border-green-500/50',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/50',
  published: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  failed: 'bg-red-500/20 text-red-300 border-red-500/50',
};

const statusLabels = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  published: 'Published',
  failed: 'Failed',
};

export default function ContentCard({
  item,
  onApprove,
  onReject,
  onRegenerate,
  onDelete,
}: ContentCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleAction = async (action: string, handler: (id: string) => Promise<void>) => {
    setLoading(action);
    try {
      await handler(item.id);
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not scheduled';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors">
      {/* Image */}
      {item.image_base64 && (
        <div
          className="relative cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <img
            src={`data:image/jpeg;base64,${item.image_base64}`}
            alt={item.quote}
            className={`w-full object-cover transition-all ${expanded ? 'max-h-none' : 'max-h-48'}`}
          />
          {!expanded && (
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[item.status]}`}>
            {statusLabels[item.status]}
          </span>
          <span className="text-xs text-slate-500">
            {formatDate(item.scheduled_date)}
          </span>
        </div>

        {/* Quote */}
        <p className="text-sm text-slate-300 mb-2 line-clamp-3">
          "{item.quote}"
        </p>
        {item.author && (
          <p className="text-xs text-slate-500 mb-3">— {item.author}</p>
        )}

        {/* Source Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
            {item.source === 'curated' ? 'Curated' : 'AI Generated'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {item.status === 'pending' && (
            <>
              <button
                onClick={() => handleAction('approve', onApprove)}
                disabled={loading !== null}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
              >
                {loading === 'approve' ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => handleAction('reject', onReject)}
                disabled={loading !== null}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
              >
                {loading === 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
            </>
          )}

          {item.status === 'rejected' && (
            <button
              onClick={() => handleAction('regenerate', onRegenerate)}
              disabled={loading !== null}
              className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {loading === 'regenerate' ? 'Regenerating...' : 'Regenerate'}
            </button>
          )}

          {item.status === 'approved' && (
            <span className="flex-1 px-3 py-2 bg-slate-700 rounded-lg text-sm text-center text-slate-400">
              Ready to Post
            </span>
          )}

          {item.status === 'published' && (
            <span className="flex-1 px-3 py-2 bg-slate-700 rounded-lg text-sm text-center text-slate-400">
              Posted
            </span>
          )}

          <button
            onClick={() => handleAction('delete', onDelete)}
            disabled={loading !== null}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-sm transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
