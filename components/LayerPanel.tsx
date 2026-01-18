
import React, { useState } from 'react';
import { Layer, HistoryItem } from '../types';

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({ 
  layers, activeLayerId, onSelect, onToggleVisibility, onDelete, history, onSelectHistory 
}) => {
  return (
    <aside className="w-64 bg-[#252525] border-l border-[#1a1a1a] flex flex-col z-30">
      {/* Navigation / Info Mini-Panel */}
      <div className="h-40 border-b border-[#1a1a1a] flex flex-col p-2 gap-2">
        <div className="flex justify-between text-[10px] font-bold text-[#666] uppercase">
          <span>Navigator</span>
          <i className="fas fa-chevron-up"></i>
        </div>
        <div className="flex-1 bg-[#1a1a1a] rounded flex items-center justify-center checkerboard">
           <i className="fas fa-image text-[#333] text-4xl"></i>
        </div>
      </div>

      {/* History Panel (Collapsed by default in real photopea, but we'll show it) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[#333] border-b border-[#1a1a1a] px-2 py-1 flex justify-between items-center">
          <span className="text-[10px] font-bold text-[#aaa] uppercase tracking-wider">Layers</span>
          <div className="flex gap-2">
            <i className="fas fa-lock text-[9px] text-[#555]"></i>
            <i className="fas fa-link text-[9px] text-[#555]"></i>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="bg-[#2a2a2a] p-1 flex gap-1 border-b border-[#1a1a1a]">
          <select className="bg-[#1a1a1a] text-[10px] text-[#ccc] border border-[#444] rounded px-1 flex-1">
            <option>Normal</option>
            <option>Multiply</option>
            <option>Screen</option>
            <option>Overlay</option>
          </select>
          <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#444] rounded px-1">
            <span className="text-[9px] text-[#666]">Opacity:</span>
            <span className="text-[10px] text-[#ccc]">100%</span>
          </div>
        </div>

        {/* Layers List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#1a1a1a]">
          {layers.map((layer) => (
            <div 
              key={layer.id}
              onClick={() => onSelect(layer.id)}
              className={`flex items-center gap-2 px-2 py-1.5 border-b border-black/20 cursor-default transition-colors ${activeLayerId === layer.id ? 'bg-[#1e88e5] text-white' : 'bg-[#2a2a2a] text-[#aaa] hover:bg-[#333]'}`}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                className="w-4 h-4 flex items-center justify-center"
              >
                <i className={`fas ${layer.visible ? 'fa-eye' : 'fa-eye-slash'} text-[10px]`}></i>
              </button>
              
              <div className="w-8 h-6 bg-black rounded overflow-hidden flex items-center justify-center checkerboard border border-black">
                {layer.dataUrl && <img src={layer.dataUrl} className="w-full h-full object-cover" />}
              </div>

              <span className="text-[11px] truncate flex-1">{layer.name}</span>
            </div>
          ))}
        </div>

        {/* Panel Footer */}
        <div className="h-8 bg-[#333] border-t border-[#1a1a1a] flex items-center justify-center gap-4 text-[#888]">
          <button className="hover:text-white transition-colors"><i className="fas fa-trash-alt text-[11px]"></i></button>
          <button className="hover:text-white transition-colors"><i className="fas fa-folder text-[11px]"></i></button>
          <button className="hover:text-white transition-colors"><i className="fas fa-plus-square text-[11px]"></i></button>
          <button className="hover:text-white transition-colors"><i className="fas fa-layer-group text-[11px]"></i></button>
        </div>
      </div>
    </aside>
  );
};

export default LayerPanel;
