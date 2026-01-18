
import React, { useState } from 'react';

interface HeaderProps {
  onNew: () => void;
  onOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNew, onOpen }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menus = [
    { name: 'File', items: [{label: 'New...', action: onNew}, {label: 'Open...', action: onOpen}, {label: 'Open from URL', action: () => {}}, {label: 'Save as PSD', action: () => {}}, {label: 'Export As', sub: ['PNG', 'JPG', 'SVG', 'WebP']}] },
    { name: 'Edit', items: [{label: 'Undo', action: () => {}}, {label: 'Redo', action: () => {}}, {label: 'Copy', action: () => {}}, {label: 'Paste', action: () => {}}, {label: 'Free Transform', action: () => {}}] },
    { name: 'Image', items: [{label: 'Adjustments', action: () => {}}, {label: 'Canvas Size', action: () => {}}, {label: 'Image Size', action: () => {}}, {label: 'Rotate', action: () => {}}] },
    { name: 'Layer', items: [{label: 'New Layer', action: () => {}}, {label: 'Duplicate', action: () => {}}, {label: 'Delete', action: () => {}}, {label: 'Merge Down', action: () => {}}] },
    { name: 'Select', items: [{label: 'All', action: () => {}}, {label: 'Deselect', action: () => {}}, {label: 'Inverse', action: () => {}}, {label: 'Magic Selection', action: () => {}}] },
    { name: 'Filter', items: [{label: 'AI Style Transfer', action: () => {}}, {label: 'Sharpen', action: () => {}}, {label: 'Blur', action: () => {}}, {label: 'Noise', action: () => {}}] },
    { name: 'Window', items: [{label: 'History', action: () => {}}, {label: 'Layers', action: () => {}}, {label: 'Properties', action: () => {}}] },
    { name: 'Help', items: [{label: 'About', action: () => {}}, {label: 'Tutorials', action: () => {}}] }
  ];

  return (
    <header className="h-8 bg-[#202020] border-b border-[#1a1a1a] flex items-center px-1 z-[200] relative">
      <div className="flex items-center gap-1 px-2 border-r border-white/5 mr-2">
        <i className="fas fa-layer-group text-blue-400 text-xs"></i>
        <span className="text-[11px] font-bold text-white tracking-tighter">LUMINA</span>
      </div>
      
      <div className="flex items-center h-full">
        {menus.map((menu) => (
          <div 
            key={menu.name} 
            className="relative h-full"
            onMouseEnter={() => setActiveMenu(menu.name)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className={`px-3 h-full text-[11px] transition-colors ${activeMenu === menu.name ? 'text-white bg-[#3d3d3d]' : 'text-[#bbb] hover:text-white hover:bg-[#3d3d3d]'}`}>
              {menu.name}
            </button>
            {activeMenu === menu.name && (
              <div className="absolute top-full left-0 w-48 bg-[#3d3d3d] shadow-[0_8px_16px_rgba(0,0,0,0.5)] py-1 animate-in fade-in duration-75 border border-[#1a1a1a]">
                {menu.items.map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => { item.action?.(); setActiveMenu(null); }}
                    className="w-full text-left px-4 py-1.5 text-[11px] text-[#ddd] hover:bg-[#1e88e5] hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    {item.sub && <i className="fas fa-caret-right text-[10px] opacity-40"></i>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-4 px-3">
        <div className="text-[10px] text-[#888]">
          Memory: <span className="text-emerald-500">241MB</span>
        </div>
        <button className="bg-[#1e88e5] text-white px-2 py-0.5 rounded text-[10px] font-bold">Premium</button>
      </div>
    </header>
  );
};

export default Header;
