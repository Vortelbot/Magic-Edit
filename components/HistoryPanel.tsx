
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  currentUrl: string | null;
  onSelect: (item: HistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, currentUrl, onSelect }) => {
  return (
    <aside className="w-80 bg-black border-l border-white/5 flex flex-col z-20 shrink-0">
      <div className="p-8 border-b border-white/5 flex flex-col gap-1">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Timeline</h2>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-white italic">History</span>
          <span className="text-[10px] bg-white/5 text-slate-500 px-2 py-1 rounded-md font-mono border border-white/10">
            {history.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-40 py-20">
            <div className="w-16 h-16 rounded-full border border-dashed border-slate-700 flex items-center justify-center mb-6">
              <i className="fas fa-history text-slate-600"></i>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
              No magic yet.<br/>Your edits will appear here.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-500 relative ${item.url === currentUrl ? 'border-indigo-500 ring-4 ring-indigo-500/10 translate-x-1' : 'border-white/5 hover:border-white/20 bg-white/2'}`}
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-900">
                <img 
                  src={item.url} 
                  alt={item.prompt} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                
                {item.url === currentUrl && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in">
                    <i className="fas fa-check text-[10px] text-white"></i>
                  </div>
                )}
                
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-[11px] text-white font-bold line-clamp-2 drop-shadow-md leading-relaxed italic">
                    "{item.prompt}"
                  </p>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between bg-black/40">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <i className="fas fa-chevron-right text-[8px] text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"></i>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-8 border-t border-white/5 bg-gradient-to-t from-white/[0.02] to-transparent">
        {/* Removed branding text as requested */}
      </div>
    </aside>
  );
};

export default HistoryPanel;
