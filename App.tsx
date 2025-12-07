
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
import { logAction } from './services/loggingService';
import { BrainCircuit, Menu, X, FileText, Activity } from 'lucide-react';
import { PROPONENT_PERSONAS, SCENARIOS } from './constants';

const STORAGE_KEY = 'velox_debate_history';

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
  const sessionGuid = useRef<string>(Date.now().toString());

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

  // Responsive sidebar: Close sidebar by default on mobile on mount
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const togglePause = () => {
      if (stage !== AppStage.DEBATING) return;
      
      if (isPaused) {
          setIsPaused(false);
          pausedRef.current = false;
          if (resumeFuncRef.current) {
              resumeFuncRef.current();
              resumeFuncRef.current = null;
          }
      } else {
          setIsPaused(true);
          pausedRef.current = true;
      }
  };

  const handleInterjection = (text: string) => {
      addMessage('user', 'User (Admin)', text);
      logAction(sessionGuid.current, 'INTERJECTION', { text });
      if (isPaused) {
          togglePause();
      }
  };

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
      id: sessionGuid.current,
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
    sessionGuid.current = session.id; // Restore session ID for logs
    setStage(AppStage.COMPLETE);
    setCompleteViewMode('verdict');
    setView('app');
    
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
    
    // Log the message
    logAction(sessionGuid.current, 'MESSAGE', { role, author, contentLength: content.length, snippet: content.substring(0, 50) });
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
    sessionGuid.current = Date.now().toString(); // New Session ID
    setCurrentSessionId(null);
    setIsPaused(false);
    pausedRef.current = false;
    setShowFeedback(false);

    // LOG START
    logAction(sessionGuid.current, 'START_SIMULATION', { 
        scenario: debateConfig.scenario.id,
        context: productContext.productName,
        opponent: debateConfig.opponent.name,
        full_description: productContext.productDescription
    });

    await runSimulation(productContext, debateConfig, debateConfig.rounds);
  };

  const handleContinueDebate = async (evidence: string) => {
    if (!context || !config) return;

    if (evidence.trim()) {
        addMessage('user', 'User (Admin) - New Evidence', evidence);
        logAction(sessionGuid.current, 'CONTINUE_WITH_EVIDENCE', { evidence });
    }

    setStage(AppStage.DEBATING);
    setIsProcessing(true);
    setIsPaused(false);
    pausedRef.current = false;
    setShowFeedback(false);
    
    await runSimulation(context, config, 2);
  };

  const runSimulation = async (ctx: ProductContext, cfg: DebateConfig, roundsToRun: number) => {
    try {
      const keyToUse = apiKey || undefined;

      for (let i = 0; i < roundsToRun; i++) {
        
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

        await checkPauseParams();
        setTypingRole('moderator');
        await new Promise(r => setTimeout(r, 800));
        await checkPauseParams();

        const modResult = await generateModeratorIntervention(ctx, messagesRef.current, cfg.model, keyToUse);
        if (modResult) {
            addMessage('moderator', 'The Moderator', modResult.text, modResult.groundingMetadata);
            await new Promise(r => setTimeout(r, 1500));
        }
      }

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

      setStage(AppStage.ANALYZING);
      setTypingRole('verifier');
      
      const result = await generateAnalysis(ctx, messagesRef.current, cfg.model, keyToUse);
      setAnalysis(result);
      
      logAction(sessionGuid.current, 'ANALYSIS_COMPLETE', { score: result.viabilityScore });
      
      saveSession(messagesRef.current, result, ctx, cfg);
      setStage(AppStage.COMPLETE);
      
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

  // Helper to determine if we are in "Full Screen" mode (Debating OR Complete)
  // We use this to remove padding on mobile for an immersive experience
  const isFullScreenMode = (view === 'app') && (stage === AppStage.DEBATING || stage === AppStage.COMPLETE);

  // We now wrap everything in the main shell to ensure Sidebar is always accessible
  return (
    <div className="h-[100dvh] bg-natural-100 text-natural-900 flex font-sans selection:bg-natural-200 selection:text-natural-900 overflow-hidden">
      
      {/* Sidebar - Mobile Overlay */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <HistorySidebar 
            sessions={history}
            currentSessionId={currentSessionId}
            onSelectSession={loadSession}
            onNewSession={() => { handleReset(); setView('app'); setSidebarOpen(false); }}
            onDeleteSession={deleteSession}
            onClose={() => setSidebarOpen(false)}
            className="h-full w-full"
         />
      </div>
      
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop Push */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out border-r border-natural-300 flex-shrink-0 hidden md:block overflow-hidden`}>
         <HistorySidebar 
            sessions={history}
            currentSessionId={currentSessionId}
            onSelectSession={loadSession}
            onNewSession={() => { handleReset(); setView('app'); }}
            onDeleteSession={deleteSession}
            className="h-full w-80"
         />
      </div>

      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* Header - Always visible to ensure Sidebar toggle is accessible */}
        <header className="bg-white border-b border-natural-300 flex-shrink-0 z-20 shadow-sm">
          <div className="px-4 md:px-6 h-16 flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-natural-100 rounded-lg text-natural-600 focus:outline-none focus:ring-2 focus:ring-natural-300"
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
                    The Green Room
                </h1>
              </button>
            </div>
            
            {view === 'app' && (
                <div className="flex items-center gap-4 text-sm text-natural-600 ml-auto">
                    <span className={`hidden sm:block px-2 py-1 rounded border ${stage === AppStage.SETUP ? 'border-natural-600 text-natural-900 bg-natural-200' : 'border-natural-300'}`}>1. Setup</span>
                    <span className="hidden sm:block text-natural-300">→</span>
                    <span className={`px-2 py-1 rounded border ${stage === AppStage.DEBATING ? 'border-natural-600 text-natural-900 bg-natural-200' : 'border-natural-300'}`}>2. Sim</span>
                    <span className="hidden sm:block text-natural-300">→</span>
                    <span className={`px-2 py-1 rounded border ${stage === AppStage.COMPLETE ? 'border-natural-600 text-natural-900 bg-natural-200' : 'border-natural-300'}`}>3. Verdict</span>
                </div>
            )}
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className={`flex-1 relative flex flex-col ${isFullScreenMode ? 'overflow-hidden bg-white md:bg-natural-100' : 'overflow-y-auto bg-natural-100'}`}>
          
          <div className={`h-full flex flex-col ${isFullScreenMode ? 'max-w-full' : 'max-w-6xl mx-auto w-full'} ${!isFullScreenMode && view !== 'landing' ? 'p-4 md:p-8' : ''}`}>
            
            {view === 'landing' && (
                <div className="h-full w-full">
                    <LandingPage onStart={() => setView('app')} onAdmin={() => setView('admin')} />
                </div>
            )}

            {view === 'admin' && (
                <div className="h-full w-full p-4 md:p-8 flex items-center justify-center">
                    <AdminDashboard onBack={() => setView('landing')} />
                </div>
            )}

            {view === 'app' && (
                <>
                    {stage === AppStage.SETUP && (
                        <div className="flex flex-col items-center justify-center flex-1">
                            <SetupForm onStart={handleStartDebate} isProcessing={isProcessing} />
                        </div>
                    )}

                    {stage === AppStage.DEBATING && (
                        <div className="w-full flex flex-col items-center animate-fade-in flex-1 h-full">
                            <div className="hidden md:block mb-4 text-center mt-4">
                                <h2 className="text-2xl font-bold text-natural-800 mb-2">Simulation In Progress</h2>
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
                        <div className="flex flex-col items-center justify-center space-y-8 animate-pulse flex-1 p-8">
                            <div className="w-24 h-24 rounded-full border-4 border-natural-600 border-t-transparent animate-spin"></div>
                            <h2 className="text-3xl font-bold text-natural-800 text-center">Synthesizing Verdict...</h2>
                            <p className="text-natural-500 text-lg text-center">The Judge is reviewing the transcript.</p>
                        </div>
                    )}

                    {stage === AppStage.COMPLETE && analysis && (
                        <div className={`flex flex-col gap-6 animate-fade-in ${isFullScreenMode ? 'h-full' : 'pb-20'}`}>
                            
                            {/* View Toggles for Complete Stage */}
                            <div className={`flex justify-center ${isFullScreenMode ? 'p-2 border-b border-natural-200 bg-white' : 'mb-2'}`}>
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

                            <div className="flex-1 overflow-y-auto scrollbar-thin">
                                {completeViewMode === 'verdict' ? (
                                    <AnalysisView 
                                    result={analysis} 
                                    onReset={handleReset} 
                                    onContinue={handleContinueDebate}
                                    />
                                ) : (
                                    <div className="w-full flex flex-col items-center h-full">
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
                        </div>
                    )}
                </>
            )}

          </div>
        </main>
      </div>

      {/* Feedback Widget moved to root level to avoid overflow clipping */}
      <FeedbackWidget isVisible={showFeedback} onClose={() => setShowFeedback(false)} />
    </div>
  );
};

export default App;
