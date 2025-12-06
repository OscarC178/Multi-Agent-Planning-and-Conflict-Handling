import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { Bot, User, ShieldAlert, Scale, Send, Play, Pause, ExternalLink } from 'lucide-react';

interface DebateTranscriptProps {
  messages: Message[];
  isTyping: boolean;
  typingRole?: 'proponent' | 'opponent' | 'verifier' | 'moderator';
  isPaused: boolean;
  onTogglePause: () => void;
  onInterject: (text: string) => void;
}

const DebateTranscript: React.FC<DebateTranscriptProps> = ({ 
  messages, 
  isTyping, 
  typingRole, 
  isPaused, 
  onTogglePause,
  onInterject
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [interjectionText, setInterjectionText] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmitInterjection = (e: React.FormEvent) => {
    e.preventDefault();
    if (interjectionText.trim()) {
      onInterject(interjectionText);
      setInterjectionText('');
    }
  };

  const getAvatar = (role: string) => {
    switch (role) {
      case 'proponent':
        return <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 text-emerald-600 shrink-0 shadow-sm"><Bot size={20} /></div>;
      case 'opponent':
        return <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center border border-rose-200 text-rose-600 shrink-0 shadow-sm"><ShieldAlert size={20} /></div>;
      case 'moderator':
        return <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200 text-amber-600 shrink-0 shadow-sm"><Scale size={20} /></div>;
      case 'user':
        return <div className="w-10 h-10 rounded-full bg-natural-100 flex items-center justify-center border border-natural-300 text-natural-600 shrink-0 shadow-sm"><User size={20} /></div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-natural-100 flex items-center justify-center border border-natural-200 text-natural-500 shrink-0 shadow-sm"><User size={20} /></div>;
    }
  };

  const getBubbleStyle = (role: string) => {
    switch (role) {
      case 'proponent': return 'bg-emerald-50 text-natural-900 rounded-tl-none border border-emerald-100';
      case 'opponent': return 'bg-rose-50 text-natural-900 rounded-tr-none border border-rose-100';
      case 'moderator': return 'bg-amber-50 text-natural-900 border border-amber-100';
      case 'user': return 'bg-white text-natural-900 border border-natural-300 rounded-tr-none shadow-sm';
      default: return 'bg-white text-natural-900 border border-natural-200';
    }
  };

  const isRightAligned = (role: string) => role === 'opponent' || role === 'user';

  return (
    <div className="relative flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-white rounded-xl border border-natural-300 shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="bg-white p-4 border-b border-natural-300 flex justify-between items-center shadow-sm z-10">
        <h3 className="text-lg font-semibold text-natural-800 flex items-center gap-2">
          {isPaused ? (
             <span className="w-2 h-2 rounded-full bg-amber-500 animate-none"></span>
          ) : (
             <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
          {isPaused ? 'Simulation Paused' : 'Live Debate Feed'}
        </h3>
        
        <button 
          onClick={onTogglePause}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
             isPaused 
               ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
               : 'bg-white hover:bg-natural-50 text-natural-700 border border-natural-300'
          }`}
        >
          {isPaused ? <><Play size={14} /> Resume</> : <><Pause size={14} /> Pause</>}
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-natural-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${isRightAligned(msg.role) ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {getAvatar(msg.role)}
            
            <div className={`flex flex-col max-w-[80%] ${isRightAligned(msg.role) ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-natural-500 mb-1 px-1 flex items-center gap-2 font-medium">
                {msg.role === 'moderator' && <Scale size={12} className="text-amber-500"/>}
                {msg.author}
              </span>
              
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${getBubbleStyle(msg.role)}`}>
                {msg.content}

                {/* Grounding / Citations */}
                {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-black/5">
                    <span className="text-xs font-semibold opacity-70 block mb-1">Sources:</span>
                    <ul className="space-y-1">
                      {msg.groundingMetadata.groundingChunks.map((chunk, idx) => (
                         chunk.web?.uri && (
                           <li key={idx}>
                             <a 
                               href={chunk.web.uri} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="text-xs flex items-center gap-1 hover:underline text-natural-700 truncate"
                             >
                               <ExternalLink size={10} /> {chunk.web.title || chunk.web.uri}
                             </a>
                           </li>
                         )
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className={`flex gap-4 ${isRightAligned(typingRole || 'proponent') ? 'flex-row-reverse' : 'flex-row'}`}>
            {getAvatar(typingRole || 'proponent')}
            <div className={`flex flex-col ${isRightAligned(typingRole || 'proponent') ? 'items-end' : 'items-start'}`}>
               <div className={`p-4 rounded-2xl ${typingRole === 'opponent' ? 'rounded-tr-none' : 'rounded-tl-none'} border border-natural-200 flex items-center gap-1 bg-white shadow-sm`}>
                 <span className="w-2 h-2 bg-natural-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                 <span className="w-2 h-2 bg-natural-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                 <span className="w-2 h-2 bg-natural-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
               </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Interjection Input (Visible when Paused) */}
      {isPaused && (
        <div className="p-4 bg-white border-t border-natural-300 animate-fade-in-up">
           <form onSubmit={handleSubmitInterjection} className="relative">
              <label className="block text-xs text-natural-700 mb-1 font-medium">
                 Interject as Admin (Adds context to the debate):
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={interjectionText}
                  onChange={(e) => setInterjectionText(e.target.value)}
                  placeholder="e.g. 'Assume we have zero budget' or 'The user is non-technical'..."
                  className="flex-1 bg-white border border-natural-300 rounded-lg px-4 py-2 text-natural-800 text-sm focus:ring-1 focus:ring-natural-600 outline-none shadow-inner"
                  autoFocus
                />
                <button 
                   type="submit"
                   className="bg-natural-600 hover:bg-natural-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Send size={16} /> Send & Resume
                </button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default DebateTranscript;