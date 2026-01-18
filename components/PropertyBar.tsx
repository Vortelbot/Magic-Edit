
import React from 'react';
import { ToolType, AspectRatio } from '../types';

interface PropertyBarProps {
  activeTool: ToolType;
  brushSize: number;
  setBrushSize: (size: number) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoom: number;
}

const PropertyBar: React.FC<PropertyBarProps> = ({ 
  activeTool, brushSize, setBrushSize, aspectRatio, setAspectRatio, onZoomIn, onZoomOut, zoom 
}) => {
  return (
    <div className="h-8 bg-[#333333] border-b border-[#1a1a1a] flex items-center px-4 gap-6 text-[11px] text-[#ccc]">
      <div className="flex items-center gap-2 pr-4 border-r border-white/5">
        <i className="fas fa-mouse-pointer text-[10px] opacity-50"></i>
        <span className="font-bold capitalize">{activeTool}</span>
      </div>

      {(activeTool === 'brush' || activeTool === 'mask') && (
        <div className="flex items-center gap-3">
          <span>Size:</span>
          <input 
            type="range" min="1" max="200" value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="w-6">{brushSize}px</span>
          <span className="ml-2">Hardness:</span>
          <input type="range" min="0" max="100" defaultValue="50" className="w-16" />
        </div>
      )}

      <div className="flex items-center gap-2">
        <span>Aspect:</span>
        <select 
          className="bg-[#252525] border border-[#1a1a1a] px-1 py-0.5 rounded text-[10px]"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
        >
          <option value="1:1">1:1 Square</option>
          <option value="4:3">4:3 Standard</option>
          <option value="16:9">16:9 Wide</option>
          <option value="9:16">9:16 Portrait</option>
        </select>
      </div>

      <div className="ml-auto flex items-center gap-1 border-l border-white/5 pl-4">
        <button onClick={onZoomOut} className="w-5 h-5 hover:bg-white/10 rounded flex items-center justify-center"><i className="fas fa-minus text-[9px]"></i></button>
        <span className="w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="w-5 h-5 hover:bg-white/10 rounded flex items-center justify-center"><i className="fas fa-plus text-[9px]"></i></button>
      </div>
    </div>
  );
};

export default PropertyBar;
