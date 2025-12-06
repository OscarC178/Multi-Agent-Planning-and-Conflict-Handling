import React, { useState, useEffect } from 'react';
import { MessageSquare, Minus, ExternalLink, X } from 'lucide-react';

interface FeedbackWidgetProps {
  isVisible: boolean;
  onClose: () => void;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ isVisible, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isVisible) {
      // Show widget 5 seconds after it becomes "visible" (simulation complete)
      timer = setTimeout(() => {
        setShowWidget(true);
      }, 5000);
    } else {
      setShowWidget(false);
    }
    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!showWidget) return null;

  // Minimized State
  if (!isOpen) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-natural-800 text-white p-4 rounded-full shadow-2xl cursor-pointer hover:bg-natural-700 transition-all z-50 flex items-center gap-2 animate-bounce-in"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={20} />
        <span className="font-bold text-sm">Give Feedback</span>
      </div>
    );
  }

  // Modal State
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden border border-natural-300">
        
        {/* Header */}
        <div className="bg-natural-900 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <MessageSquare size={18} /> Help Us Improve
          </h3>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Minimize"
            >
                <Minus size={18} />
            </button>
            <button 
                onClick={onClose} 
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Close"
            >
                <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare size={32} />
            </div>

            <div>
                <h2 className="text-xl font-bold text-natural-900 mb-2">Simulation Complete!</h2>
                <p className="text-natural-600 leading-relaxed">
                    We'd love to hear about your experience. Your feedback directly shapes the personas and logic.
                </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800 font-medium">
                ⏱️ Quick: Only 10 questions - 8/10 are multichoice!
            </div>

            <a 
                href="https://forms.gle/fgxppMaEjFRM1cri9"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                    // Close the modal shortly after clicking
                    setTimeout(() => setIsOpen(false), 1000);
                }}
                className="w-full bg-natural-900 text-white font-bold py-4 rounded-xl hover:bg-natural-800 transition-colors shadow-lg flex items-center justify-center gap-2 transform hover:scale-[1.02]"
            >
                <ExternalLink size={20} />
                Open Feedback Form
            </a>
            
            <button 
                onClick={onClose}
                className="text-sm text-natural-500 hover:text-natural-800 hover:underline"
            >
                No thanks, maybe later
            </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackWidget;