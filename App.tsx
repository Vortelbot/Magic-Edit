
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, HistoryItem } from './types';
import { GeminiService } from './services/geminiService';
import HistoryPanel from './components/HistoryPanel';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentImage: null,
    history: [],
    isProcessing: false,
    prompt: '',
    error: null,
  });

  const [isMaskMode, setIsMaskMode] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Sync canvas size with image size
  useEffect(() => {
    if (state.currentImage && maskCanvasRef.current && imageRef.current) {
      const img = imageRef.current;
      const canvas = maskCanvasRef.current;
      const resizeCanvas = () => {
        canvas.width = img.clientWidth;
        canvas.height = img.clientHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      };
      
      if (img.complete) {
        resizeCanvas();
      } else {
        img.onload = resizeCanvas;
      }
    }
  }, [state.currentImage, isMaskMode]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMaskMode || state.isProcessing) return;
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !maskCanvasRef.current) return;
    const canvas = maskCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'; // Transparent Red for visual feedback
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = maskCanvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const getMaskBase64 = (): string | undefined => {
    if (!maskCanvasRef.current) return undefined;
    
    // Check if anything was drawn
    const canvas = maskCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hasMask = false;
    for (let i = 3; i < pixelData.length; i += 4) {
      if (pixelData[i] > 0) {
        hasMask = true;
        break;
      }
    }
    
    if (!hasMask) return undefined;

    // Create a temporary black & white canvas for the API
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return undefined;

    tCtx.fillStyle = 'black';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Copy the drawn areas as white
    tCtx.globalCompositeOperation = 'source-over';
    tCtx.drawImage(canvas, 0, 0);
    
    // Filter to make drawn area purely white and others purely black
    const imgData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const alpha = imgData.data[i + 3];
      if (alpha > 0) {
        imgData.data[i] = 255;   // R
        imgData.data[i+1] = 255; // G
        imgData.data[i+2] = 255; // B
        imgData.data[i+3] = 255; // A
      } else {
        imgData.data[i] = 0;
        imgData.data[i+1] = 0;
        imgData.data[i+2] = 0;
        imgData.data[i+3] = 255;
      }
    }
    tCtx.putImageData(imgData, 0, 0);
    
    return tempCanvas.toDataURL('image/png');
  };

  const handleProcess = useCallback(async () => {
    if (!state.prompt.trim() || !state.currentImage) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const mask = getMaskBase64();
      const gemini = GeminiService.getInstance();
      const newImageUrl = await gemini.processImage(state.prompt, state.currentImage, mask);

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        url: newImageUrl,
        prompt: state.prompt + (mask ? " (targeted area)" : ""),
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        currentImage: newImageUrl,
        history: [newItem, ...prev.history],
        isProcessing: false,
        prompt: '',
      }));
      clearMask();
      setIsMaskMode(false);
    } catch (err: any) {
      setState(prev => ({ ...prev, isProcessing: false, error: err.message }));
    }
  }, [state.prompt, state.currentImage]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setState(prev => ({
          ...prev,
          currentImage: url,
          error: null
        }));
        clearMask();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-2xl z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 rotate-3">
            <i className="fas fa-wand-magic-sparkles text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase">Magic <span className="text-indigo-400">Edit</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pixel Surgery AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {state.currentImage && (
            <>
              <button 
                onClick={() => {
                  setIsMaskMode(!isMaskMode);
                  if (!isMaskMode) clearMask();
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${isMaskMode ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
              >
                <i className={`fas ${isMaskMode ? 'fa-pen-nib' : 'fa-paintbrush'}`}></i>
                <span>{isMaskMode ? 'Masking ON' : 'Mark Area'}</span>
              </button>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = state.currentImage!;
                  link.download = `magic-edit-${Date.now()}.png`;
                  link.click();
                }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-slate-300 hover:text-white"
                title="Download Image"
              >
                <i className="fas fa-download"></i>
              </button>
            </>
          )}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10 active:scale-95"
          >
            {state.currentImage ? 'New File' : 'Upload Image'}
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Workspace */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-12 bg-[#0a0a0c] checkerboard overflow-hidden" ref={containerRef}>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
          
          <div className="w-full h-full flex items-center justify-center relative">
            {state.currentImage ? (
              <div className="relative group max-w-full max-h-full flex items-center justify-center select-none">
                <img 
                  ref={imageRef}
                  src={state.currentImage} 
                  className={`max-w-full max-h-[75vh] object-contain rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 transition-all duration-700 ${state.isProcessing ? 'opacity-30 blur-2xl scale-105' : 'opacity-100 scale-100'}`}
                  alt="Current workspace"
                  draggable={false}
                />
                
                {/* Drawing Layer */}
                <canvas
                  ref={maskCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className={`absolute inset-0 z-20 cursor-crosshair rounded-3xl touch-none ${!isMaskMode || state.isProcessing ? 'pointer-events-none' : 'pointer-events-auto'}`}
                />

                {isMaskMode && (
                  <div className="absolute top-4 left-4 z-30 flex flex-col gap-3">
                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-2">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Brush Size</span>
                          <span className="text-[10px] font-mono text-indigo-400">{brushSize}px</span>
                       </div>
                       <input 
                        type="range" 
                        min="5" max="100" 
                        value={brushSize} 
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-32 accent-indigo-500"
                       />
                       <button 
                        onClick={clearMask}
                        className="mt-2 py-2 px-3 bg-white/5 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors border border-white/5"
                       >
                        Clear Marks
                       </button>
                    </div>
                  </div>
                )}
                
                {state.isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-500 z-[100]">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fas fa-sparkles text-indigo-400 animate-pulse"></i>
                      </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-2xl">
                      <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Applying Magic...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-3xl aspect-[16/9] border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center gap-8 cursor-pointer hover:bg-white/5 hover:border-indigo-500/40 transition-all group overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent"
              >
                <div className="relative">
                   <div className="w-24 h-24 bg-slate-900 rounded-[30px] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl rotate-6 group-hover:rotate-12 duration-500">
                    <i className="fas fa-image text-4xl text-slate-500 group-hover:text-indigo-400"></i>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl border-4 border-[#0a0a0c]">
                    <i className="fas fa-plus text-white text-xs"></i>
                  </div>
                </div>
                <div className="text-center px-8">
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-3">Magic Start</h3>
                  <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">
                    Upload a photo and tell the AI exactly what to change. 
                    <br/><span className="text-slate-600">Tip: Use the brush to mark specific areas!</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Bar */}
          {state.currentImage && (
            <div className="absolute bottom-12 w-full max-w-4xl px-8 animate-in slide-in-from-bottom-12 duration-700 ease-out z-[60]">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-500 rounded-[32px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative bg-black/80 backdrop-blur-3xl border border-white/10 p-3 rounded-[28px] shadow-2xl flex items-center gap-4 ring-1 ring-white/5">
                  <div className="pl-5 text-indigo-400">
                    <i className={`fas ${isMaskMode ? 'fa-wand-sparkles' : 'fa-comment-dots'} text-lg`}></i>
                  </div>
                  <input
                    type="text"
                    value={state.prompt}
                    onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
                    placeholder={isMaskMode ? "What should happen in the marked area?..." : "Describe your magic edit..."}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white py-4 px-2 text-xl font-medium outline-none placeholder:text-slate-600"
                    disabled={state.isProcessing}
                  />
                  <button
                    onClick={handleProcess}
                    disabled={state.isProcessing || !state.prompt.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-10 py-5 rounded-2xl font-black transition-all flex items-center gap-3 active:scale-95 shadow-2xl shadow-indigo-600/20 uppercase tracking-widest text-xs shrink-0"
                  >
                    {state.isProcessing ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-bolt"></i>
                    )}
                    <span>Apply Magic</span>
                  </button>
                </div>
              </div>
              {isMaskMode && (
                <p className="text-center mt-4 text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em] animate-pulse">
                  Now marking pixels for targeted editing
                </p>
              )}
            </div>
          )}
        </div>

        {/* History Panel */}
        <HistoryPanel 
          history={state.history} 
          currentUrl={state.currentImage}
          onSelect={(item) => {
            setState(prev => ({ ...prev, currentImage: item.url }));
            clearMask();
            setIsMaskMode(false);
          }} 
        />
      </main>

      {/* Error Alert */}
      {state.error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-rose-600/90 backdrop-blur-xl text-white px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(225,29,72,0.3)] flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <i className="fas fa-circle-exclamation text-xl"></i>
          <div>
            <p className="font-black text-xs uppercase tracking-widest mb-0.5">Edit Failed</p>
            <p className="font-medium text-sm opacity-90">{state.error}</p>
          </div>
          <button onClick={() => setState(prev => ({ ...prev, error: null }))} className="ml-4 hover:rotate-90 transition-transform">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
