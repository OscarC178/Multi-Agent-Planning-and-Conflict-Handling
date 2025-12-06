
import React, { useState, useRef, useEffect } from 'react';
import SetupForm from './components/SetupForm';
import DebateTranscript from './components/DebateTranscript';
import AnalysisView from './components/AnalysisView';
import HistorySidebar from './components/HistorySidebar';
import LandingPage from './components/LandingPage';
import FeedbackWidget from './components/FeedbackWidget';
import AdminDashboard from './components/AdminDashboard';
import { AppStage, ProductContext, DebateConfig, Message, AnalysisResult, SavedSession } from './types';
import { generateProponentResponse, generateOpponentResponse, generateAnalysis, generateModeratorIntervention } from './services/geminiService';
import { BrainCircuit, Menu, X, FileText, Activity } from 'lucide-react';
import { PROPONENT_PERSONAS, SCENARIOS } from './constants';

const STORAGE_KEY = 'velox_debate_history';
// const API_KEY_STORAGE = 'velox_api_key'; // API Key handled by environment or hidden state

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'landing' | 'app' | 'admin'>('landing');

  // App State
  const [stage, setStage] = useState<AppStage>(AppStage.SETUP);
  const [context, setContext] = useState<ProductContext | null>(null);
  const [config, setConfig] = useState<DebateConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [typingRole, setTypingRole] = useState<'proponent' | 'opponent' | 'verifier' | 'moderator'>('proponent');
  
  // API Key State (Hidden logic)
  // We assume process.env.API_KEY is available.
  const [apiKey] = useState(''); 

  // Pause & Interjection State
  const [isPaused, setIsPaused] = useState(false);
  const pausedRef = useRef(false);
  const resumeFuncRef = useRef<(() => void) | null>(null);

  // History State
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // View mode for COMPLETE stage (Verdict vs Transcript)
  const [completeViewMode, setCompleteViewMode] = useState<'verdict' | 'transcript'>('verdict');

  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);

  // Refs
  const messagesRef = useRef<Message[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const togglePause = () => {
      if (stage !== AppStage.DEBATING) return;
      
      if (isPaused) {
          // Resume
          setIsPaused(false);
          pausedRef.current = false;
          if (resumeFuncRef.current) {
              resumeFuncRef.current();
              resumeFuncRef.current = null;
          }
      } else {
          // Pause
          setIsPaused(true);
          pausedRef.current = true;
      }
  };

  const handleInterjection = (text: string) => {
      addMessage('user', 'User (Admin)', text);
      // Resume after interjection
      if (isPaused) {
          togglePause();
      }
  };

  // Async helper to wait if paused
  const checkPauseParams = async () => {
    if (pausedRef.current) {
        await new Promise<void>((resolve) => {
            resumeFuncRef.current = resolve;
        });
    }
  };

  const saveSession = (
    finalMessages: Message[], 
    finalAnalysis: AnalysisResult, 
    ctx: ProductContext, 
    cfg: DebateConfig
  ) => {
    const newSession: SavedSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      productName: ctx.productName,
      opponentName: cfg.opponent.name,
      context: ctx,
      config: cfg,
      messages: finalMessages,
      analysis: finalAnalysis
    };

    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(s => s.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (currentSessionId === id) {
      handleReset();
    }
  };

  const loadSession = (session: SavedSession) => {
    setContext(session.context);
    
    // Backward compatibility for old sessions without proponent/scenario in config
    const safeConfig = {
        ...session.config,
        proponent: session.config.proponent || PROPONENT_PERSONAS[0],
        scenario: session.config.scenario || SCENARIOS[0]
    };
    
    setConfig(safeConfig);
    setMessages(session.messages);
    messagesRef.current = session.messages;
    setAnalysis(session.analysis);
    setCurrentSessionId(session.id);
    setStage(AppStage.COMPLETE);
    setCompleteViewMode('verdict');
    setView('app'); // Ensure we leave landing page
    
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const addMessage = (role: 'proponent' | 'opponent' | 'verifier' | 'moderator' | 'user', author: string, content: string, groundingMetadata?: any) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      role,
      author,
      content,
      timestamp: Date.now(),
      groundingMetadata
    };
    setMessages((prev) => {
      const updated = [...prev, newMessage];
      messagesRef.current = updated;
      return updated;
    });
  };

  const handleStartDebate = async (productContext: ProductContext, debateConfig: DebateConfig) => {
    if (!apiKey && !process.env.API_KEY) {
        console.warn("No API Key found. Assuming process.env.API_KEY is available in service layer.");
    }

    setContext(productContext);
    setConfig(debateConfig);
    setStage(AppStage.DEBATING);
    setIsProcessing(true);
    setMessages([]);
    messagesRef.current = [];
    setCurrentSessionId(null);
    setIsPaused(false);
    pausedRef.current = false;
    setShowFeedback(false);

    await runSimulation(productContext, debateConfig, debateConfig.rounds);
  };

  const handleContinueDebate = async (evidence: string) => {
    if (!context || !config) return;

    if (evidence.trim()) {
        addMessage('user', 'User (Admin) - New Evidence', evidence);
    }

    setStage(AppStage.DEBATING);
    setIsProcessing(true);
    setIsPaused(false);
    pausedRef.current = false;
    setShowFeedback(false);
    
    // Run for 2 extra rounds
    await runSimulation(context, config, 2);
  };

  const runSimulation = async (ctx: ProductContext, cfg: DebateConfig, roundsToRun: number) => {
    try {
      const keyToUse = apiKey || undefined;

      for (let i = 0; i < roundsToRun; i++) {
        
        // --- TURN A: Proponent ---
        await checkPauseParams();
        setTypingRole('proponent');
        await new Promise(r => setTimeout(r, 800));
        await checkPauseParams();

        const propResponse = await generateProponentResponse(
            ctx, 
            messagesRef.current, 
            cfg.proponent, 
            cfg.opponent, 
            cfg.model, 
            cfg.scenario,
            keyToUse
        );
        addMessage('proponent', cfg.proponent.name, propResponse);

        // --- TURN B: Opponent ---
        await checkPauseParams();
        setTypingRole('opponent');
        await new Promise(r => setTimeout(r, 1200));
        await checkPauseParams();

        const oppResponse = await generateOpponentResponse(
            ctx, 
            messagesRef.current, 
            cfg.opponent, 
            cfg.model, 
            cfg.scenario,
            keyToUse
        );
        addMessage('opponent', cfg.opponent.name, oppResponse);

        // --- TURN C: Moderator Check ---
        await checkPauseParams();
        setTypingRole('moderator');
        // Small delay to simulate "checking"
        await new Promise(r => setTimeout(r, 800));
        await checkPauseParams();

        const modResult = await generateModeratorIntervention(ctx, messagesRef.current, cfg.model, keyToUse);
        if (modResult) {
            addMessage('moderator', 'The Moderator', modResult.text, modResult.groundingMetadata);
            // If moderator intervened, give user a chance to read it (short delay)
            await new Promise(r => setTimeout(r, 1500));
        }
      }

      // --- CLOSING ---
      await checkPauseParams();
      setTypingRole('proponent');
      await new Promise(r => setTimeout(r, 800));
      await checkPauseParams();
      
      const closing = await generateProponentResponse(
          ctx, 
          messagesRef.current, 
          cfg.proponent, 
          cfg.opponent, 
          cfg.model, 
          cfg.scenario,
          keyToUse
      );
      addMessage('proponent', `${cfg.proponent.name} (Closing)`, closing);

      // --- VERDICT ---
      setStage(AppStage.ANALYZING);
      setTypingRole('verifier');
      
      const result = await generateAnalysis(ctx, messagesRef.current, cfg.model, keyToUse);
      setAnalysis(result);
      
      saveSession(messagesRef.current, result, ctx, cfg);
      setStage(AppStage.COMPLETE);
      
      // Trigger Feedback Widget
      setShowFeedback(true);

    } catch (error) {
      console.error("Simulation failed", error);
      alert("An error occurred during the simulation. Check API Key or Console.");
      setStage(AppStage.SETUP);
    } finally {
      setIsProcessing(false);
      setIsPaused(false);
      pausedRef.current = false;
    }
  };

  const handleReset = () => {
    setStage(AppStage.SETUP);
    setMessages([]);
    setAnalysis(null);
    setContext(null);
    setConfig(null);
    messagesRef.current = [];
    setCurrentSessionId(null);
    setIsPaused(false);
    setShowFeedback(false);
  };

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('app')} onAdmin={() => setView('admin')} />;
  }

  if (view === 'admin') {
    return <AdminDashboard onBack={() => setView('landing')} />;
  }

  return (
    <div className="h-screen bg-natural-100 text-natural-900 flex font-sans selection:bg-natural-200 selection:text-natural-900 overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out border-r border-natural-300 flex-shrink-0 hidden md:block overflow-hidden`}>
         <HistorySidebar 
            sessions={history}
            currentSessionId={currentSessionId}
            onSelectSession={loadSession}
            onNewSession={handleReset}
            onDeleteSession={deleteSession}
            className="h-full w-80"
         />
      </div>

      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* Header */}
        <header className="bg-white border-b border-natural-300 flex-shrink-0 z-20 shadow-sm">
          <div className="px-6 h-16 flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-natural-100 rounded-lg text-natural-600"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <button 
                onClick={() => setView('landing')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="bg-natural-600 p-1.5 rounded-lg">
                    <BrainCircuit className="text-white" size={18} />
                </div>
                <h1 className="text-lg font-bold text-natural-800 hidden lg:block">
                    Debate Planner
                </h1>
              </button>
            </div>

            {/* API Key Input Removed from Header */}
            
            <div className="flex items-center gap-4 text-sm text-natural-600 ml-auto">
              <span className={`hidden sm:block px-2 py-1 rounded border ${stage === AppStage.SETUP ? 'border-natural-600 text-natural-900 bg-natural-200' : 'border-natural-300'}`}>1. Setup</span>
              <span className="hidden sm:block text-natural-300">→</span>
              <span className={`px-2 py-1 rounded border ${stage === AppStage.DEBATING ? 'border-natural-600 text-natural-900 bg-natural-200' : 'border-natural-300'}`}>2. Sim</span>
              <span className="hidden sm:block text-natural-300">→</span>
              <span className={`px-2 py-1 rounded border ${stage === AppStage.COMPLETE ? 'border-natural-600 text-natural-900 bg-natural-200' : 'border-natural-300'}`}>3. Verdict</span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-natural-100 relative">
          
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            
            {stage === AppStage.SETUP && (
              <div className="flex flex-col items-center justify-center flex-1">
                <SetupForm onStart={handleStartDebate} isProcessing={isProcessing} />
              </div>
            )}

            {stage === AppStage.DEBATING && (
              <div className="w-full flex flex-col items-center animate-fade-in flex-1">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-natural-800 mb-2">Simulation In Progress</h2>
                    <p className="text-natural-600">
                      Scenario: <span className="text-natural-900 font-bold">{config?.scenario.label}</span>
                    </p>
                    <p className="text-natural-500 text-sm mt-1">
                       <span className="text-emerald-700 font-medium">{context?.productName}</span> vs. <span className="text-rose-700 font-medium">{config?.opponent.name}</span>
                    </p>
                </div>
                <DebateTranscript 
                    messages={messages} 
                    isTyping={true} 
                    typingRole={typingRole}
                    isPaused={isPaused}
                    onTogglePause={togglePause}
                    onInterject={handleInterjection}
                />
              </div>
            )}

            {stage === AppStage.ANALYZING && (
              <div className="flex flex-col items-center justify-center space-y-8 animate-pulse flex-1">
                <div className="w-24 h-24 rounded-full border-4 border-natural-600 border-t-transparent animate-spin"></div>
                <h2 className="text-3xl font-bold text-natural-800">Synthesizing Verdict...</h2>
                <p className="text-natural-500 text-lg">The Judge is reviewing the transcript.</p>
              </div>
            )}

            {stage === AppStage.COMPLETE && analysis && (
              <div className="flex flex-col gap-6 animate-fade-in pb-20">
                
                {/* View Toggles for Complete Stage */}
                <div className="flex justify-center mb-2">
                   <div className="bg-white p-1 rounded-lg flex border border-natural-300 shadow-sm">
                      <button
                        onClick={() => setCompleteViewMode('verdict')}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
                            completeViewMode === 'verdict' 
                            ? 'bg-natural-200 text-natural-900 shadow-sm' 
                            : 'text-natural-600 hover:text-natural-800'
                        }`}
                      >
                         <Activity size={16} /> Verdict
                      </button>
                      <button
                        onClick={() => setCompleteViewMode('transcript')}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
                            completeViewMode === 'transcript' 
                            ? 'bg-natural-200 text-natural-900 shadow-sm' 
                            : 'text-natural-600 hover:text-natural-800'
                        }`}
                      >
                         <FileText size={16} /> Transcript
                      </button>
                   </div>
                </div>

                {completeViewMode === 'verdict' ? (
                    <AnalysisView 
                      result={analysis} 
                      onReset={handleReset} 
                      onContinue={handleContinueDebate}
                    />
                ) : (
                    <div className="w-full flex flex-col items-center">
                       <DebateTranscript 
                          messages={messages} 
                          isTyping={false}
                          isPaused={false}
                          onTogglePause={() => {}}
                          onInterject={() => {}}
                       />
                    </div>
                )}
              </div>
            )}
          </div>
        </main>
        
        {/* Feedback Widget */}
        <FeedbackWidget isVisible={showFeedback} onClose={() => setShowFeedback(false)} />
        
      </div>
    </div>
  );
};

export default App;
