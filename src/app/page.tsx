'use client';

import { useState, useRef, useEffect } from 'react';

interface GeneratedContent {
  image: string;
  quote: {
    text: string;
    author: string;
    source: string;
  };
}

const WIDTH = 1080;
const HEIGHT = 1350;

export default function Home() {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render text on canvas when content changes
  useEffect(() => {
    if (content && canvasRef.current) {
      renderTextOnCanvas(content);
    }
  }, [content]);

  const renderTextOnCanvas = (data: GeneratedContent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Draw background image
      ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);

      // Add dark overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Configure text style for quote
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;

      // Wrap and draw quote text
      const lines = wrapText(ctx, data.quote.text, WIDTH - 120, 58);
      const lineHeight = 75;
      const totalHeight = lines.length * lineHeight + 80;
      let startY = (HEIGHT - totalHeight) / 2 + 60;

      ctx.font = 'italic 58px Georgia, "Times New Roman", serif';

      lines.forEach((line, i) => {
        const y = startY + i * lineHeight;
        const displayLine = i === 0 ? `"${line}` : (i === lines.length - 1 ? `${line}"` : line);
        ctx.strokeText(displayLine, WIDTH / 2, y);
        ctx.fillText(displayLine, WIDTH / 2, y);
      });

      // Draw author
      ctx.font = '38px Arial, sans-serif';
      ctx.lineWidth = 2;
      const authorY = startY + lines.length * lineHeight + 50;
      ctx.strokeText(`— ${data.quote.author}`, WIDTH / 2, authorY);
      ctx.fillText(`— ${data.quote.author}`, WIDTH / 2, authorY);

      // Save final image
      setFinalImage(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.src = `data:image/jpeg;base64,${data.image}`;
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] => {
    ctx.font = `italic ${fontSize}px Georgia, "Times New Roman", serif`;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines;
  };

  const generateImage = async () => {
    setLoading(true);
    setError(null);
    setFinalImage(null);

    try {
      const response = await fetch('/api/generate', {
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
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">InspirePost</h1>
          <p className="text-slate-400">AI-Generated Inspirational Quote Images</p>
        </header>

        <div className="flex flex-col items-center gap-8">
          <button
            onClick={generateImage}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate New Quote'
            )}
          </button>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg px-6 py-4 text-red-200">
              {error}
            </div>
          )}

          {/* Hidden canvas for rendering */}
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="hidden"
          />

          {finalImage && content && (
            <div className="flex flex-col items-center gap-6">
              <div className="rounded-xl overflow-hidden shadow-2xl" style={{ maxWidth: '400px' }}>
                <img
                  src={finalImage}
                  alt="Generated quote"
                  className="w-full h-auto"
                />
              </div>

              <div className="text-center text-slate-400 text-sm">
                <p>"{content.quote.text}"</p>
                <p className="mt-1">— {content.quote.author}</p>
                <p className="mt-2 text-xs text-slate-500">Source: {content.quote.source}</p>
              </div>

              <a
                href={finalImage}
                download="inspirepost-quote.jpg"
                className="px-6 py-2 border border-slate-600 rounded-full hover:bg-slate-700 transition-colors text-sm"
              >
                Download Image
              </a>
            </div>
          )}

          {!finalImage && !loading && (
            <div className="text-center text-slate-500 mt-8">
              <p>Click the button above to generate your first inspirational quote image!</p>
              <p className="text-sm mt-2">Images are 1080x1350px (Instagram 4:5 portrait)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
