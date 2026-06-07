import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Trash2, Undo2, Eraser, Paintbrush, Sparkles, RefreshCw, Layers, Sliders, CheckCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  isEraser: boolean;
}

interface SimpleSketchToolProps {
  onBack: () => void;
}

const COLOR_PRESETS = [
  { name: 'Charcoal', value: '#1f2937' },
  { name: 'Sky Blue', value: '#0ea5e9' },
  { name: 'Cyan Accent', value: '#06b6d4' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Rose pink', value: '#ec4899' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Crimson', value: '#ef4444' },
];

export function generateHTMLFromStrokes(strokes: Stroke[], animation: 'float' | 'bounce' | 'pulse' | 'spin' | 'wave' | 'glitch'): string {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let hasPoints = false;

  strokes.forEach((stk) => {
    stk.points.forEach((pt) => {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
      hasPoints = true;
    });
  });

  if (!hasPoints) {
    minX = 0;
    maxX = 800;
    minY = 0;
    maxY = 600;
  } else {
    // Add margin around drawing
    minX -= 40;
    minY -= 40;
    maxX += 40;
    maxY += 40;
  }

  const width = Math.max(100, maxX - minX);
  const height = Math.max(100, maxY - minY);

  // Render SVG paths with styles matching color presets
  const svgPaths = strokes.map((stk) => {
    if (stk.points.length < 1) return '';
    const pointsData = stk.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const strokeColor = stk.isEraser ? '#ffffff' : stk.color;
    return `    <path d="${pointsData}" stroke="${strokeColor}" stroke-dasharray="" stroke-width="${stk.width}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animated Sketch Loop</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ffffff;
            overflow: hidden;
            font-family: system-ui, -apple-system, sans-serif;
        }

        /* Tech design grid lines background */
        .grid-backdrop {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(to right, #f1f5f9 1px, transparent 1px),
                linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
            background-size: 24px 24px;
            z-index: 1;
        }

        .sketch-container {
            position: relative;
            z-index: 2;
            width: 85%;
            height: 85%;
            max-width: 800px;
            max-height: 600px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.08));
            transform-origin: center center;
            animation: ${animation} 2.5s infinite ease-in-out;
        }

        /* Keyframes for beautiful dynamic animation loop */
        @keyframes float {
            0%, 100% {
                transform: translateY(0px) rotate(0deg);
            }
            50% {
                transform: translateY(-24px) rotate(2.5deg);
            }
        }

        @keyframes bounce {
            0%, 100% {
                transform: translateY(0) scale(1, 1);
            }
            30% {
                transform: translateY(-60px) scale(0.95, 1.05);
            }
            50% {
                transform: translateY(0) scale(1.08, 0.92);
            }
            70% {
                transform: translateY(-12px) scale(0.98, 1.02);
            }
            90% {
                transform: translateY(0) scale(1.01, 0.99);
            }
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        @keyframes wave {
            0%, 100% {
                transform: translateX(0) skewX(0);
            }
            50% {
                transform: translateX(25px) skewX(3deg);
            }
        }

        @keyframes glitch {
            0%, 100% {
                transform: translate(0, 0);
            }
            92% {
                transform: translate(0, 0);
            }
            93% {
                transform: translate(-4px, 3px);
                filter: hue-rotate(90deg) contrast(1.2);
            }
            94% {
                transform: translate(3px, -2px);
                filter: hue-rotate(180deg) brightness(1.1);
            }
            95% {
                transform: translate(0, 0);
            }
        }
    </style>
</head>
<body>
    <div class="grid-backdrop"></div>
    <div class="sketch-container">
        <svg viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}" xmlns="http://www.w3.org/2000/svg">
${svgPaths}
        </svg>
    </div>
</body>
</html>`;
}

export default function SimpleSketchTool({ onBack }: SimpleSketchToolProps) {
  // Canvas State
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [currentColor, setCurrentColor] = useState('#1f2937');
  const [brushWidth, setBrushWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Interaction / Setup View
  const [mode, setMode] = useState<'draw' | 'animating' | 'result'>('draw'); // draw, animating, result
  const [animationPrompt, setAnimationPrompt] = useState('');
  const [generationStep, setGenerationStep] = useState(0);
  const [currentPromptLabel, setCurrentPromptLabel] = useState('Default Dynamic Float');

  // Playback/Result State
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeAnimation, setActiveAnimation] = useState<'float' | 'bounce' | 'pulse' | 'spin' | 'wave' | 'glitch'>('float');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [htmlCode, setHtmlCode] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playbackCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Keep a strokes reference ref to avoid recreation/canvas reset issues
  const strokesRef = useRef<Stroke[]>(strokes);
  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  // Load saved sketch code from backend Neon SQL or localStorage on mount
  useEffect(() => {
    fetch('/api/tools/simple-sketch-tool-code')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.code) {
          setHtmlCode(data.code);
        } else {
          const local = localStorage.getItem('simpleSketchToolCode');
          if (local) {
            setHtmlCode(local);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Keep database in sync on debounce modifier updates
  useEffect(() => {
    if (!htmlCode) return;
    const timeout = setTimeout(() => {
      localStorage.setItem('simpleSketchToolCode', htmlCode);
      fetch('/api/tools/simple-sketch-tool-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: htmlCode }),
      }).catch(console.error);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [htmlCode]);

  // Auto-resize handler for editor canvas
  useEffect(() => {
    if (mode === 'draw') {
      const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (!rect) return;
        
        // Save current strokes, resize canvas, and redraw
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = rect.height * (window.devicePixelRatio || 1);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
          redrawCanvas(ctx, strokesRef.current);
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mode]);

  // Keep editor canvas updated when strokes list updates
  useEffect(() => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      redrawCanvas(ctx, strokes);
    }
  }, [strokes, mode]);

  // Handle Playback Loop when in results mode
  useEffect(() => {
    if (mode === 'result' && isPlaying) {
      const canvas = playbackCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = rect.height * (window.devicePixelRatio || 1);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      }

      let startTime = Date.now();

      const loop = () => {
        if (!ctx || !canvas) return;
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Drawing a beautiful tech grid in background
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        const gridSize = 24;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        const elapsed = (Date.now() - startTime) / 1000;
        
        // Calculate bounding box of strokes to rotate/bounce about our sketch center
        const bounds = getStrokesBounds(strokes, width, height);

        ctx.save();

        // Translate to sketch center
        ctx.translate(bounds.cx, bounds.cy);

        // Apply physical transformation based on selected animation pattern
        if (activeAnimation === 'float') {
          // Drifts and rotates gently
          const tx = Math.sin(elapsed * 1.5) * 20;
          const ty = Math.cos(elapsed * 1.1) * 15;
          const rot = Math.sin(elapsed * 0.7) * 0.08;
          ctx.translate(tx, ty);
          ctx.rotate(rot);
        } else if (activeAnimation === 'bounce') {
          // Squash and stretch gravity jump
          const period = 1.6;
          const progress = (elapsed % period) / period; // 0 to 1
          const yOffset = Math.abs(Math.sin(progress * Math.PI)) * -60;
          let scaleY = 1;
          let scaleX = 1;
          
          if (progress > 0.85 || progress < 0.15) {
            // Squash on bottom hit
            const squashFactor = Math.sin(progress * Math.PI * 2) * 0.15;
            scaleY = 1 - Math.abs(squashFactor);
            scaleX = 1 + Math.abs(squashFactor);
          } else {
            // Stretch in mid air
            const stretchFactor = Math.cos(progress * Math.PI) * 0.08;
            scaleY = 1 + Math.abs(stretchFactor);
            scaleX = 1 - Math.abs(stretchFactor * 0.5);
          }
          
          ctx.translate(0, yOffset);
          ctx.scale(scaleX, scaleY);
        } else if (activeAnimation === 'pulse') {
          // Breathing scale
          const scale = 1 + Math.sin(elapsed * 3) * 0.12;
          ctx.scale(scale, scale);
        } else if (activeAnimation === 'spin') {
          // Clean revolving loop
          ctx.rotate(elapsed * 1.2);
        } else if (activeAnimation === 'wave') {
          // Wavy horizontal drift
          const tx = Math.sin(elapsed * 2.5) * 35;
          ctx.translate(tx, 0);
        } else if (activeAnimation === 'glitch') {
          // Randomized key jump and scale
          if (Math.random() > 0.88) {
            ctx.translate((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
            ctx.scale(1 + (Math.random() - 0.5) * 0.1, 1 + (Math.random() - 0.5) * 0.1);
          }
        }

        // Translate back from sketch center
        ctx.translate(-bounds.cx, -bounds.cy);

        // Render strokes
        strokes.forEach((stroke) => {
          if (stroke.points.length < 1) return;
          ctx.beginPath();
          ctx.strokeStyle = stroke.isEraser ? '#ffffff' : stroke.color;
          ctx.lineWidth = stroke.width;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Hand-sketch dynamic wiggly vibration effect to feel organic/animated
          const isSketchedWiggle = activeAnimation === 'wave' || activeAnimation === 'float' || activeAnimation === 'glitch';
          const wiggleAmp = isSketchedWiggle ? 0.6 : 0.2;

          const startPt = stroke.points[0];
          const wx = isPlaying ? Math.sin(elapsed * 15 + 0) * wiggleAmp : 0;
          const wy = isPlaying ? Math.cos(elapsed * 12 + 0) * wiggleAmp : 0;
          ctx.moveTo(startPt.x + wx, startPt.y + wy);

          for (let i = 1; i < stroke.points.length; i++) {
            const pt = stroke.points[i];
            const pxOffset = isPlaying ? Math.sin(elapsed * 15 + i) * wiggleAmp : 0;
            const pyOffset = isPlaying ? Math.cos(elapsed * 12 + i) * wiggleAmp : 0;
            ctx.lineTo(pt.x + pxOffset, pt.y + pyOffset);
          }
          ctx.stroke();
        });

        ctx.restore();

        // Overlay dynamic motion trackers
        ctx.fillStyle = '#88d5f7';
        ctx.strokeStyle = 'rgba(136, 213, 247, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        
        // Draw physical track path around actual animated coordinates
        ctx.beginPath();
        ctx.arc(bounds.cx, bounds.cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.setLineDash([]);

        animationFrameRef.current = requestAnimationFrame(loop);
      };

      animationFrameRef.current = requestAnimationFrame(loop);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [mode, isPlaying, strokes, activeAnimation]);

  // Calculate center and boundary bounds of overall sketch
  const getStrokesBounds = (allStrokes: Stroke[], fallbackW: number, fallbackH: number) => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let hasPoints = false;

    allStrokes.forEach((stk) => {
      stk.points.forEach((pt) => {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
        hasPoints = true;
      });
    });

    if (!hasPoints) {
      return { cx: fallbackW / 2, cy: fallbackH / 2, w: 200, h: 200 };
    }

    return {
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
      w: maxX - minX,
      h: maxY - minY,
    };
  };

  // Redraw complete canvas
  const redrawCanvas = (ctx: CanvasRenderingContext2D, allStrokes: Stroke[]) => {
    const canvas = ctx.canvas;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    
    ctx.clearRect(0, 0, width, height);

    // Draw grid lines in editor canvas
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    allStrokes.forEach((stroke) => {
      if (stroke.points.length < 1) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.isEraser ? '#ffffff' : stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const startPt = stroke.points[0];
      ctx.moveTo(startPt.x, startPt.y);
      for (let i = 1; i < stroke.points.length; i++) {
        const pt = stroke.points[i];
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    });
  };

  // Get pointer coordinates relative to the canvas layout rect
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Event Handlers for Canvas Drawing
  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    const newStroke: Stroke = {
      points: [coords],
      color: currentColor,
      width: brushWidth,
      isEraser,
    };
    setStrokes((prev) => [...prev, newStroke]);
    setRedoStack([]); // Clear redo stack on new action
  };

  const handleMoving = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      last.points = [...last.points, coords];
      updated[updated.length - 1] = last;
      return updated;
    });
  };

  const handleStopDrawing = () => {
    setIsDrawing(false);
  };

  // Undo and Redo functions
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const popped = strokes[strokes.length - 1];
    setStrokes((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, popped]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextStk = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setStrokes((prev) => [...prev, nextStk]);
  };

  const handleClear = () => {
    setStrokes([]);
    setRedoStack([]);
  };

  const changeAnimation = (anim: 'float' | 'bounce' | 'pulse' | 'spin' | 'wave' | 'glitch') => {
    setActiveAnimation(anim);
    const updated = generateHTMLFromStrokes(strokes, anim);
    setHtmlCode(updated);
  };

  // Triggers simulated intelligent vector animation compiler
  const handleAnimateSketch = (e: React.FormEvent) => {
    e.preventDefault();
    if (strokes.length === 0) {
      alert('Please draw something on the sketch canvas first!');
      return;
    }

    // Capture prompt label
    const userPrompt = animationPrompt.trim();
    setCurrentPromptLabel(userPrompt || 'Default Floating Loop');

    // Parse animation keywords of custom input box to activate relevant canvas animation
    let detectedAnimation: 'float' | 'bounce' | 'pulse' | 'spin' | 'wave' | 'glitch' = 'float';
    const lower = userPrompt.toLowerCase();
    
    if (lower.includes('bounce') || lower.includes('gravity') || lower.includes('jump') || lower.includes('hop')) {
      detectedAnimation = 'bounce';
    } else if (lower.includes('shake') || lower.includes('glitch') || lower.includes('vibrate') || lower.includes('distort')) {
      detectedAnimation = 'glitch';
    } else if (lower.includes('pulse') || lower.includes('breath') || lower.includes('grow') || lower.includes('heartbeat') || lower.includes('scale')) {
      detectedAnimation = 'pulse';
    } else if (lower.includes('spin') || lower.includes('rotate') || lower.includes('turn') || lower.includes('revolve')) {
      detectedAnimation = 'spin';
    } else if (lower.includes('wave') || lower.includes('wind') || lower.includes('slide') || lower.includes('drift') || lower.includes('wiggle')) {
      detectedAnimation = 'wave';
    }
    setActiveAnimation(detectedAnimation);

    // Switch view to animation compiled screen
    setMode('animating');
    setGenerationStep(0);

    // Dynamic processing sequence with glowing states
    let step = 0;
    const interval = setInterval(() => {
      step += 4;
      if (step >= 100) {
        clearInterval(interval);
        setGenerationStep(100);
        
        // Compile drawing into standard HTML format
        const codeOut = generateHTMLFromStrokes(strokes, detectedAnimation);
        setHtmlCode(codeOut);
        setViewMode('preview');
        setMode('result');
      } else {
        setGenerationStep(step);
      }
    }, 80);
  };

  // Dynamic feedback phrase
  const getLoadingPhrase = (percentage: number) => {
    if (percentage < 25) return 'Extracting vector path anchors...';
    if (percentage < 50) return 'Applying custom motion formulas...';
    if (percentage < 75) return 'Generating dynamic vertex interpolations...';
    return 'Baking interactive physics frames...';
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <header className="h-16 border-b border-gray-200/80 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={mode === 'result' ? () => setMode('draw') : onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-gray-600"
            id="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase bg-[#c5efff] text-[#0369a1] px-2 py-0.5 rounded-full">
                Interactive Drawing
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
            </div>
            <h1 className="font-semibold text-gray-900 text-sm md:text-base leading-tight">
              Simple Sketch Workspace
            </h1>
          </div>
        </div>

        {/* Top bar indicators */}
        <div className="flex items-center gap-3">
          {mode === 'draw' && (
            <div className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full hidden sm:block">
              Strokes: {strokes.length}
            </div>
          )}
          {mode === 'result' && (
            <>
              {/* Code / Preview Selector Bar */}
              <div className="flex bg-slate-100 rounded-full p-0.5 border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold select-none transition-all ${
                    viewMode === 'preview' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="preview-mode-toggle"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('code')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold select-none transition-all ${
                    viewMode === 'code' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="code-mode-toggle"
                >
                  Code
                </button>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Animated Live
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative overflow-hidden">
        
        {/* DRAW MODE SIDEBAR PANEL */}
        {mode === 'draw' && (
          <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200/80 bg-white p-5 flex flex-col gap-6 shrink-0 z-10 overflow-y-auto">
            <div>
              <h2 className="font-semibold text-[15px] text-gray-900 mb-1.5 flex items-center gap-2">
                <Paintbrush className="w-4 h-4 text-sky-500" /> Brush Tools
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Sketch anything you wish. You can toggle between paintbrush and eraser modes.
              </p>
            </div>

            {/* Brush & Eraser Toggles */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() => setIsEraser(false)}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                  !isEraser 
                    ? 'bg-white text-gray-900 shadow-sm border border-slate-100' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                id="brush-button"
              >
                <Paintbrush className="w-4 h-4" />
                Draw
              </button>
              <button
                type="button"
                onClick={() => setIsEraser(true)}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                  isEraser 
                    ? 'bg-white text-[#ef4444] shadow-sm border border-slate-100' 
                    : 'text-gray-500 hover:text-[#ef4444]'
                }`}
                id="eraser-button"
              >
                <Eraser className="w-4 h-4" />
                Eraser
              </button>
            </div>

            {/* Brush Width Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-gray-500" /> Size
                </span>
                <span className="font-mono text-gray-500 font-semibold">{brushWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={brushWidth}
                onChange={(e) => setBrushWidth(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#88d5f7]"
                id="brush-size-input"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Fine</span>
                <span>Thick</span>
              </div>
            </div>

            {/* Palette Presets */}
            {!isEraser && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-700 block">
                  Select Accent Color
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setCurrentColor(color.value)}
                      className={`aspect-square rounded-full transition-all flex items-center justify-center relative hover:scale-110 shadow-sm`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {currentColor === color.value && (
                        <span className="w-2.5 h-2.5 bg-white rounded-full border border-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* History Management */}
            <div className="mt-auto pt-6 border-t border-gray-100 space-y-2 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={strokes.length === 0}
                  className="py-2 px-3 border border-gray-200 hover:bg-slate-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-medium shadow-sm"
                  title="Undo previous stroke"
                  id="undo-btn"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Undo
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="py-2 px-3 border border-gray-200 hover:bg-slate-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-medium shadow-sm"
                  title="Redo stroke"
                  id="redo-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Redo
                </button>
              </div>
              
              <button
                type="button"
                onClick={handleClear}
                disabled={strokes.length === 0}
                className="w-full py-2.5 px-3 border border-red-200 hover:bg-red-50 text-red-600 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-semibold"
                id="clear-btn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Workspace
              </button>
            </div>
          </aside>
        )}

        {/* WORKSPACE & CANVAS WRAPPER */}
        <main className="flex-1 min-w-0 bg-slate-50 p-6 flex flex-col gap-4 relative overflow-hidden h-full items-center justify-center">
          
          {/* A: WORKSPACE DRAW MODE - INTERACTIVE DRAWING CANVAS */}
          {mode === 'draw' && (
            <div className="w-full h-full flex flex-col justify-between max-w-4xl relative">
              
              <div className="flex-1 bg-white border border-gray-200 rounded-3xl relative overflow-hidden shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                {/* Visual guidelines backdrop */}
                <div className="absolute top-4 left-4 text-xs font-mono text-gray-400 bg-slate-100/80 px-2 py-1 rounded select-none pointer-events-none z-10">
                  Sketch Area (Vector Vector Mode)
                </div>

                <div className="absolute top-4 right-4 flex gap-1.5 pointer-events-none select-none z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 animate-pulse"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                </div>

                {strokes.length === 0 && (
                  <div className="absolute inset-x-8 text-center pointer-events-none select-none flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                      <Paintbrush className="w-6 h-6 text-[#88d5f7]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm md:text-base">Start Sketching Here</h3>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        Draw your object using paint strokes, then type below how you desire it to come alive. Touch screens supported!
                      </p>
                    </div>
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  onMouseDown={handleStartDrawing}
                  onMouseMove={handleMoving}
                  onMouseUp={handleStopDrawing}
                  onMouseLeave={handleStopDrawing}
                  onTouchStart={handleStartDrawing}
                  onTouchMove={handleMoving}
                  onTouchEnd={handleStopDrawing}
                  className="absolute inset-0 cursor-crosshair touch-none"
                  id="drawing-canvas-element"
                />
              </div>

              {/* FLOATING ANIMATION DESCRIPTION FORM AT BOTTOM */}
              <form 
                onSubmit={handleAnimateSketch}
                className="mt-4 bg-white/95 backdrop-blur-md p-3.5 border border-gray-200/90 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-3 items-center"
              >
                <div className="relative flex-1 w-full flex items-center">
                  <Sparkles className="absolute left-3.5 text-[#88d5f7] w-5 h-5 shrink-0" />
                  <input
                    type="text"
                    value={animationPrompt}
                    onChange={(e) => setAnimationPrompt(e.target.value)}
                    placeholder="Ask how to animate (e.g. 'Bounce like a happy ball', 'Float with wind')"
                    className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-slate-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#88d5f7] transition-all"
                    id="animation-prompt-input"
                  />
                </div>

                <div className="w-full sm:w-auto flex justify-end shrink-0">
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#c5efff] hover:bg-[#a1e1fc] active:scale-95 text-gray-900 font-semibold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
                    id="animate-sketch-submit"
                  >
                    <Sparkles className="w-4 h-4 text-[#0284c7]" />
                    Animate Tool
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* B: SIMULATED VIDEO ANIMATING / RENDER LOADER SCREEN */}
          {mode === 'animating' && (
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 shadow-md flex flex-col items-center justify-center text-center gap-6">
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Spinning loader with light blue accents */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#88d5f7] animate-spin"></div>
                <Sparkles className="w-8 h-8 text-[#88d5f7] animate-pulse" />
              </div>

              <div className="space-y-2 w-full">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Rendering Pipeline
                </span>
                <h3 className="text-lg font-bold text-gray-800">Animating Your Sketch...</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  "{animationPrompt || 'Live vector loop'}"
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="w-full space-y-2 mt-2">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#88d5f7] to-cyan-400 transition-all duration-150 ease-out"
                    style={{ width: `${generationStep}%` }}
                    id="animate-progress-bar"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                  <span>{getLoadingPhrase(generationStep)}</span>
                  <span>{generationStep}%</span>
                </div>
              </div>
            </div>
          )}

          {/* C: PLAYBACK / RESULTS SCREEN */}
          {mode === 'result' && (
            <div className="w-full h-full flex flex-col max-w-4xl relative">
              
              {/* Playback Stage Container */}
              <div className="flex-1 bg-white border border-gray-200 rounded-3xl relative overflow-hidden shadow-sm flex items-center justify-center min-h-[400px]">
                {viewMode === 'preview' ? (
                  <>
                    {/* Backdrop Trackers */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1 z-10 pointer-events-none select-none">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-green-500 bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span> Live Physics
                      </span>
                      <span className="text-xs font-semibold text-gray-700 bg-white/80 px-2 py-1 rounded shadow-sm border border-slate-100">
                        Prompt: "{currentPromptLabel}"
                      </span>
                    </div>

                    {/* Preset Fast Selector Buttons */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-1 border border-slate-200 rounded-xl flex items-center gap-1 z-10 shadow-sm">
                      {(['float', 'bounce', 'pulse', 'spin', 'wave', 'glitch'] as const).map((anim) => (
                        <button
                          key={anim}
                          type="button"
                          onClick={() => changeAnimation(anim)}
                          className={`px-2.5 py-1 text-[11px] font-semibold capitalize rounded-lg transition-all ${
                            activeAnimation === anim 
                              ? 'bg-[#c5efff] text-[#0284c7] shadow-sm' 
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          {anim}
                        </button>
                      ))}
                    </div>

                    {/* Interactive Frame Preview rendering compiled dynamic SVG code with inline CSS animations */}
                    <iframe
                      srcDoc={htmlCode}
                      className="w-full h-full border-none pointer-events-auto"
                      title="Sketch Video Loop Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />

                    {/* Floating Media Controls overlay */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-white/95 backdrop-blur shadow-md border border-slate-200 rounded-2xl flex items-center gap-2 z-10 transition-transform">
                      <button
                        type="button"
                        onClick={() => {
                          const nextPlay = !isPlaying;
                          setIsPlaying(nextPlay);
                          if (nextPlay) {
                            changeAnimation(activeAnimation);
                          } else {
                            const pausedHtml = htmlCode.replace('infinite ease-in-out', 'paused ease-in-out');
                            setHtmlCode(pausedHtml);
                          }
                        }}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                        title={isPlaying ? 'Pause' : 'Play'}
                        id="playback-toggle-btn"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-slate-800" /> : <Play className="w-4 h-4 fill-slate-800" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMode('draw');
                        }}
                        className="px-3.5 py-2 hover:bg-slate-50 text-xs text-gray-700 font-semibold border border-slate-200 rounded-xl transition-all flex items-center gap-1.5"
                        id="redraw-btn"
                      >
                        <Layers className="w-3.5 h-3.5 text-gray-500" />
                        Modify Drawing
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[#1e1e1e] flex flex-col">
                    <div className="bg-[#2d3139] border-b border-[#111] py-1.5 px-4 flex justify-between items-center text-xs text-gray-400 select-none shrink-0 font-mono">
                      <span>generated-loop.html (Editable HTML representation)</span>
                      <span className="text-[#88d5f7] font-semibold flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-sky-400 rounded-full"></span> Live Compile
                      </span>
                    </div>
                    <div className="flex-1 min-h-0 relative">
                      <Editor
                        height="100%"
                        defaultLanguage="html"
                        theme="vs-dark"
                        value={htmlCode}
                        onChange={(value) => setHtmlCode(value || '')}
                        options={{
                          minimap: { enabled: true },
                          fontSize: 13,
                          wordWrap: 'on',
                          padding: { top: 12 }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Lower Details Card & Export */}
              <div className="mt-4 bg-white p-4 border border-gray-200 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold text-gray-800 text-sm">Simulated Live Render Complete</h4>
                  <p className="text-xs text-gray-500">Vector physics model baked. Run loop is fully responsive.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('draw')}
                    className="px-4 py-2 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl text-gray-700 hover:bg-slate-50 transition-colors"
                  >
                    New drawing
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Download simulated loop! Loop output file successfully cached in the catalog.')}
                    className="px-4 py-2 bg-[#c5efff] hover:bg-[#a1e1fc] text-xs sm:text-sm font-semibold rounded-xl text-[#0369a1] transition-colors"
                  >
                    Export Loop
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>

      </div>
    </div>
  );
}
