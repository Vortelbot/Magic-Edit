
import React from 'react';
import { ToolType } from '../types';

interface ToolPanelProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  onUpload: () => void;
  onDownload: () => void;
  hasImage: boolean;
}

const ToolPanel: React.FC<ToolPanelProps> = ({ activeTool, setActiveTool, onUpload, onDownload, hasImage }) => {
  return (
    <div className="w-10 bg-[#252525] border-r border-[#1a1a1a] flex flex-col items-center py-2 gap-1 z-30">
      <ToolBtn icon="fa-mouse-pointer" active={activeTool === 'select'} onClick={() => setActiveTool('select')} title="Move (V)" />
      <ToolBtn icon="fa-vector-square" active={false} onClick={() => {}} title="Marquee (M)" />
      <ToolBtn icon="fa-lasso" active={false} onClick={() => {}} title="Lasso (L)" />
      <ToolBtn icon="fa-wand-magic-sparkles" active={activeTool === 'mask'} onClick={() => setActiveTool('mask')} title="AI Selection (W)" />
      <ToolBtn icon="fa-crop-simple" active={activeTool === 'crop'} onClick={() => setActiveTool('crop')} title="Crop (C)" />
      <ToolBtn icon="fa-eye-dropper" active={false} onClick={() => {}} title="Eyedropper (I)" />
      
      <div className="w-6 h-px bg-white/5 my-1"></div>
      
      <ToolBtn icon="fa-brush" active={activeTool === 'brush'} onClick={() => setActiveTool('brush')} title="Brush (B)" />
      <ToolBtn icon="fa-eraser" active={false} onClick={() => {}} title="Eraser (E)" />
      <ToolBtn icon="fa-fill-drip" active={false} onClick={() => {}} title="Gradient (G)" />
      <ToolBtn icon="fa-droplet" active={false} onClick={() => {}} title="Blur / Sharpen" />
      
      <div className="w-6 h-px bg-white/5 my-1"></div>
      
      <ToolBtn icon="fa-pen-nib" active={false} onClick={() => {}} title="Pen (P)" />
      <ToolBtn icon="fa-font" active={false} onClick={() => {}} title="Type (T)" />
      <ToolBtn icon="fa-shapes" active={false} onClick={() => {}} title="Rectangle (U)" />
      
      <div className="w-6 h-px bg-white/5 my-1"></div>
      
      <ToolBtn icon="fa-hand" active={activeTool === 'pan'} onClick={() => setActiveTool('pan')} title="Hand (Space)" />
      <ToolBtn icon="fa-search" active={false} onClick={() => {}} title="Zoom (Z)" />

      <div className="mt-auto flex flex-col items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-white border border-black shadow-inner"></div>
        <div className="w-5 h-5 bg-black border border-white -mt-3 ml-2 shadow-inner"></div>
      </div>
    </div>
  );
};

const ToolBtn = ({ icon, active, onClick, title, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-8 h-8 flex items-center justify-center transition-all relative group ${active ? 'bg-[#555] text-white' : 'text-[#888] hover:bg-[#3d3d3d] hover:text-[#ccc]'} ${disabled ? 'opacity-20 pointer-events-none' : ''}`}
  >
    <i className={`fas ${icon} text-[13px]`}></i>
    <span className="absolute left-full ml-2 px-2 py-1 bg-[#111] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-[300] pointer-events-none shadow-xl border border-white/10 transition-all">
      {title}
    </span>
  </button>
);

export default ToolPanel;
