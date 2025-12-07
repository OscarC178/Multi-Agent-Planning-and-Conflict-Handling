
import React from 'react';
import { SavedSession } from '../types';
import { Plus, Trash2, Clock, X } from 'lucide-react';

interface HistorySidebarProps {
  sessions: SavedSession[];
  currentSessionId: string | null;
  onSelectSession: (session: SavedSession) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClose?: () => void; // New prop for closing on mobile
  className?: string;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClose,
  className
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex flex-col bg-white border-r border-natural-300 h-full ${className}`}>
      
      {/* Sidebar Header with Close Button for Mobile */}
      <div className="p-4 border-b border-natural-300 flex items-center gap-2">
        <button
          onClick={onNewSession}
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-natural-50 border border-natural-300 text-natural-700 py-2 px-3 rounded-lg transition-colors font-medium text-sm shadow-sm whitespace-nowrap"
        >
          <Plus size={16} /> New Debate
        </button>
        {onClose && (
            <button 
                onClick={onClose}
                className="md:hidden p-2 text-natural-500 hover:bg-natural-100 rounded-lg"
                title="Close Sidebar"
            >
                <X size={20} />
            </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2">
        {sessions.length === 0 && (
          <div className="text-center text-natural-400 text-xs py-8 px-4">
            No history yet. Start a simulation to save your first debate.
          </div>
        )}
        
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session)}
            className={`group relative flex flex-col p-3 rounded-lg cursor-pointer transition-all border ${
              currentSessionId === session.id
                ? 'bg-natural-200 border-natural-400 shadow-sm'
                : 'bg-transparent border-transparent hover:bg-natural-50 hover:border-natural-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-semibold truncate pr-2 ${currentSessionId === session.id ? 'text-natural-800' : 'text-natural-700'}`}>
                {session.productName || "Untitled"}
              </span>
              <button
                onClick={(e) => onDeleteSession(session.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-natural-400 hover:text-rose-500 transition-opacity"
                title="Delete session"
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            <div className="flex items-center text-xs text-natural-500 gap-1 mb-1">
               <span className="truncate max-w-[120px]">vs. {session.opponentName}</span>
            </div>

            <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-natural-400 flex items-center gap-1">
                    <Clock size={10} /> {formatDate(session.timestamp)}
                </span>
                {session.analysis && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        session.analysis.viabilityScore >= 80 ? 'bg-emerald-100 text-emerald-600' :
                        session.analysis.viabilityScore >= 50 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-rose-100 text-rose-600'
                    }`}>
                        {session.analysis.viabilityScore}%
                    </span>
                )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-natural-300 text-xs text-natural-400 text-center">
        History saved locally
      </div>
    </div>
  );
};

export default HistorySidebar;
