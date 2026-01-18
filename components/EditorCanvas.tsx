
import React, { useRef, useState } from 'react';
import { ToolType, Layer } from '../types';

interface EditorCanvasProps {
  layers: Layer[];
  activeLayerId: string | null;
  isProcessing: boolean;
  onPromptSubmit: (action: any) => void;
  promptValue: string;
  onPromptChange: (val: string) => void;
  activeTool: ToolType;
  brushSize: number;
  zoom: number;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({ 
  layers, activeLayerId, isProcessing, onPromptSubmit, promptValue, onPromptChange, activeTool, brushSize, zoom 
}) => {
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeAction, setActiveAction] = useState<string>('edit');

  const startDrawing = (e: React.MouseEvent) => {
    if (activeTool !== 'brush' && activeTool !== 'mask') return;
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !maskCanvasRef.current) return;
    const canvas = maskCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = activeTool === 'mask' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(79, 70, 229, 0.4)';

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

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#333]">
      {/* Workspace Area */}
      <div className="flex-1 w-full relative flex items-center justify-center overflow-auto custom-scrollbar py-20 px-20">
        <div 
          className="relative shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-transform duration-100 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Main Layer Render */}
          <div className="relative border border-black bg-black min-w-[300px] min-h-[300px]">
            {layers.slice().reverse().map((layer) => (
               layer.visible && layer.dataUrl && (
                 <img 
                   key={layer.id}
                   src={layer.dataUrl} 
                   className={`max-w-[4000px] max-h-[4000px] object-contain transition-all ${isProcessing && layer.id === activeLayerId ? 'opacity-40 animate-pulse grayscale' : 'opacity-100'}`}
                 />
               )
             ))}

             {/* UI Mask Layer */}
             <canvas
               ref={maskCanvasRef}
               width={2000}
               height={2000}
               onMouseDown={startDrawing}
               onMouseMove={draw}
               onMouseUp={stopDrawing}
               onMouseLeave={stopDrawing}
               className={`absolute inset-0 w-full h-full z-10 cursor-crosshair ${activeTool === 'mask' || activeTool === 'brush' ? 'pointer-events-auto' : 'pointer-events-none'}`}
             />
          </div>
        </div>
      </div>

      {/* Integrated AI Tool Strip (Prompt at bottom like a modern addition to Photopea) */}
      <div className="h-14 bg-[#252525] border-t border-[#1a1a1e] w-full flex items-center px-4 gap-4 z-40">
        <div className="flex gap-1 shrink-0">
          {['edit', 'fill', 'remove', 'style', 'background'].map(a => (
            <button 
              key={a}
              onClick={() => setActiveAction(a)}
              className={`px-3 py-1 rounded text-[10px] uppercase font-bold tracking-tighter border ${activeAction === a ? 'bg-[#1e88e5] border-[#1e88e5] text-white' : 'bg-[#1a1a1a] border-[#444] text-[#888] hover:text-[#ccc]'}`}
            >
              {a}
            </button>
          ))}
        </div>
        
        <div className="flex-1 bg-[#1a1a1a] border border-[#444] rounded flex items-center px-3 gap-2">
          <i className="fas fa-magic text-blue-500 text-[10px]"></i>
          <input
            type="text"
            value={promptValue}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onPromptSubmit(activeAction)}
            placeholder="AI Prompt..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-[12px] text-white py-2 outline-none"
            disabled={isProcessing}
          />
        </div>

        <button
          onClick={() => onPromptSubmit(activeAction)}
          disabled={isProcessing || !promptValue.trim()}
          className="bg-[#1e88e5] hover:bg-[#1976d2] disabled:bg-[#444] text-white text-[11px] font-bold px-6 h-9 rounded transition-all flex items-center gap-2"
        >
          {isProcessing ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-play"></i>}
          <span>Apply</span>
        </button>
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-[500] bg-black/30 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
           <div className="bg-[#222] border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-[11px] font-bold text-blue-400 tracking-widest uppercase">AI Calculating...</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default EditorCanvas;
