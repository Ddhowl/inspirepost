'use client';

import { useState } from 'react';
import CalendarView from '@/components/CalendarView';

interface GeneratedContent {
  image: string;
  quote: {
    text: string;
    author: string;
    source: string;
  };
  promptUsed?: string;
  saved?: boolean;
  contentId?: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'queue' | 'generate'>('queue');
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const generateImage = async (saveToDb: boolean = false) => {
    setLoading(true);
    setError(null);
    setContent(null);

    try {
      const url = saveToDb ? '/api/generate?save=true' : '/api/generate';
      const response = await fetch(url, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setContent(data);
      } else {
        setError(data.error || 'Failed to generate image');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">InspirePost</h1>
          <p className="text-slate-400">AI-Generated Inspirational Quote Images</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'queue'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Content Queue
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'generate'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Generate Preview
            </button>
          </div>
        </div>

        {/* Content Queue Tab */}
        {activeTab === 'queue' && (
          <div>
            <CalendarView />
          </div>
        )}

        {/* Generate Preview Tab */}
        {activeTab === 'generate' && (
          <div className="flex flex-col items-center gap-8">
            <div className="flex gap-4">
              <button
                onClick={() => generateImage(false)}
                disabled={loading}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Preview Only'}
              </button>
              <button
                onClick={() => generateImage(true)}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate & Save to Queue'
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg px-6 py-4 text-red-200 max-w-xl">
                {error}
              </div>
            )}

            {content && (
              <div className="flex flex-col items-center gap-6">
                {/* Saved indicator */}
                {content.saved && (
                  <div className="bg-green-500/20 border border-green-500 rounded-lg px-4 py-2 text-green-300 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved to queue
                  </div>
                )}

                {/* Generated image */}
                <div className="rounded-xl overflow-hidden shadow-2xl" style={{ maxWidth: '400px' }}>
                  <img
                    src={`data:image/jpeg;base64,${content.image}`}
                    alt="Generated quote"
                    className="w-full h-auto"
                  />
                </div>

                <div className="text-center text-slate-400 text-sm">
                  <p>"{content.quote.text}"</p>
                  <p className="mt-1">— {content.quote.author}</p>
                  <p className="mt-2 text-xs text-slate-500">Source: {content.quote.source}</p>
                </div>

                <div className="flex gap-4">
                  <a
                    href={`data:image/jpeg;base64,${content.image}`}
                    download="inspirepost-quote.jpg"
                    className="px-6 py-2 border border-slate-600 rounded-full hover:bg-slate-700 transition-colors text-sm"
                  >
                    Download Image
                  </a>

                  <button
                    onClick={() => setShowPrompt(!showPrompt)}
                    className="px-6 py-2 border border-purple-600 rounded-full hover:bg-purple-900/30 transition-colors text-sm text-purple-300"
                  >
                    {showPrompt ? 'Hide Prompt' : 'Show Prompt'}
                  </button>
                </div>

                {/* Show the prompt used for generation */}
                {showPrompt && content.promptUsed && (
                  <div className="w-full max-w-2xl bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-purple-400 mb-2">Gemini 3 Pro Prompt Used:</h3>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto">
                      {content.promptUsed}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {!content && !loading && (
              <div className="text-center text-slate-500 mt-8">
                <p>Generate a preview to see what your next quote image will look like.</p>
                <p className="text-sm mt-2">Uses Gemini 3 Pro (Nano Banana Pro) to generate images with text</p>
                <p className="text-sm mt-1">Images are 1080x1350px (Instagram 4:5 portrait)</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
