import React, { useState, useMemo, useEffect } from 'react';
import { ProductContext, DebateConfig, OpponentPersona, ProponentPersona, AIModel, Scenario, Attachment } from '../types';
import { OPPONENT_PERSONAS, PROPONENT_PERSONAS, DEFAULT_ROUNDS, AVAILABLE_MODELS, SCENARIOS } from '../constants';
import { Settings, Play, UserCircle, AlignLeft, Info, AlertCircle, Users, Building2, Globe, Target, Paperclip, X, Sparkles } from 'lucide-react';

interface SetupFormProps {
  onStart: (context: ProductContext, config: DebateConfig) => void;
  isProcessing: boolean;
}

const SetupForm: React.FC<SetupFormProps> = ({ onStart, isProcessing }) => {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  
  // Scenario State
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);

  // Proponent State
  const [selectedProponent, setSelectedProponent] = useState<ProponentPersona>(PROPONENT_PERSONAS[0]);
  const [showProponentInfo, setShowProponentInfo] = useState(false);
  
  // Opponent State
  const [opponentCategory, setOpponentCategory] = useState<'internal' | 'external'>('internal');
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentPersona | null>(null);
  const [showOpponentInfo, setShowOpponentInfo] = useState(false);

  // Hardcoded to Gemini 3 Pro (Beta requirement)
  const [selectedModel] = useState<AIModel>(AVAILABLE_MODELS[0]);
  
  const [rounds, setRounds] = useState(DEFAULT_ROUNDS);
  const [showInfo, setShowInfo] = useState(false);

  // Filter proponents based on scenario
  const filteredProponents = useMemo(() => {
    return PROPONENT_PERSONAS.filter(p => !p.associatedScenarios || p.associatedScenarios.includes(selectedScenario.id));
  }, [selectedScenario]);

  // Filter opponents based on category AND scenario
  const filteredOpponents = useMemo(() => {
    return OPPONENT_PERSONAS.filter(p => 
        p.category === opponentCategory && 
        (!p.associatedScenarios || p.associatedScenarios.includes(selectedScenario.id))
    );
  }, [opponentCategory, selectedScenario]);

  // Reset Proponent selection if the current selection is filtered out
  useEffect(() => {
    if (filteredProponents.length > 0) {
        const isCurrentValid = filteredProponents.find(p => p.id === selectedProponent.id);
        if (!isCurrentValid) {
            setSelectedProponent(filteredProponents[0]);
        }
    }
  }, [filteredProponents, selectedProponent]);

  // Reset Opponent selection if filtered out
  useEffect(() => {
    if (filteredOpponents.length > 0) {
        const isCurrentValid = filteredOpponents.find(p => p.id === selectedOpponent?.id);
        if (!isCurrentValid) {
            setSelectedOpponent(filteredOpponents[0]);
        }
    } else {
        setSelectedOpponent(null);
    }
  }, [filteredOpponents, selectedOpponent]);

  // Switch category if current category is empty but other has items (UX fix)
  useEffect(() => {
    if (filteredOpponents.length === 0) {
        // Check if the OTHER category has items
        const otherCategory = opponentCategory === 'internal' ? 'external' : 'internal';
        const otherHasItems = OPPONENT_PERSONAS.some(p => 
            p.category === otherCategory && 
            (!p.associatedScenarios || p.associatedScenarios.includes(selectedScenario.id))
        );
        if (otherHasItems) {
            setOpponentCategory(otherCategory);
        }
    }
  }, [selectedScenario, opponentCategory, filteredOpponents.length]);

  const wordCount = description.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Array.from(FileList) can infer as unknown[] in some TS configs, so we cast to File[]
      const newFiles = Array.from(e.target.files) as File[];
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setFiles(prev => [...prev, {
            name: file.name,
            mimeType: file.type,
            data: base64String
          }]);
        };
        reader.readAsDataURL(file);
      });
      // Clear input so same file can be selected again if needed
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
        alert("Please enter a scenario description.");
        return;
    }
    if (!selectedOpponent) {
        alert("Please select a Red Team opponent.");
        return;
    }

    // Derive a display name from the description (first few words)
    const words = description.trim().split(/\s+/);
    const derivedName = words.length > 5 
      ? words.slice(0, 5).join(' ') + '...' 
      : words.join(' ');

    onStart(
      { productName: derivedName, productDescription: description, files: files },
      { rounds, proponent: selectedProponent, opponent: selectedOpponent, model: selectedModel, scenario: selectedScenario }
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-natural-300 animate-fade-in-up">
      <div className="bg-white p-6 border-b border-natural-300 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-natural-800 flex items-center gap-2">
            <Settings className="text-natural-600" />
            Mission Configuration
            </h2>
            <p className="text-natural-500 mt-1">Define the context and choose your adversarial team.</p>
        </div>
        {/* Beta Badge - New Requirement */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
            <Sparkles size={14} className="text-blue-500" />
            <span className="text-xs font-semibold text-blue-700">Beta: Powered by Gemini 3 Pro</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        
        {/* Scenario Selection */}
        <div>
           <label className="block text-sm font-medium text-natural-700 mb-2 flex items-center gap-2">
             <Target size={16} /> Framework / Scenario
           </label>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
             {SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario)}
                  className={`cursor-pointer px-3 py-3 rounded-lg border flex flex-col gap-1 transition-all ${
                    selectedScenario.id === scenario.id
                      ? 'bg-natural-200 border-natural-600 ring-1 ring-natural-600 text-natural-900'
                      : 'bg-white border-natural-300 hover:bg-natural-50 text-natural-600'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wide">{scenario.label}</span>
                  <span className="text-[10px] opacity-80 leading-tight">{scenario.description}</span>
                </div>
             ))}
           </div>
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          
          <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-natural-700 flex items-center gap-2">
                    <AlignLeft size={16}/> Scenario / Product Context
                </label>
                <div className="relative">
                    <button 
                        type="button"
                        className="text-natural-400 hover:text-natural-600 transition-colors"
                        onClick={() => setShowInfo(!showInfo)}
                        onMouseEnter={() => setShowInfo(true)}
                        onMouseLeave={() => setShowInfo(false)}
                    >
                        <Info size={18} />
                    </button>
                    
                    {/* Tooltip / Example Popover */}
                    {showInfo && (
                        <div className="absolute right-0 top-6 w-80 bg-natural-800 border border-natural-700 rounded-lg p-4 shadow-xl z-50 text-xs text-natural-200">
                            <h4 className="font-bold text-natural-200 mb-2">Recommended Structure:</h4>
                            {selectedScenario.id === 'life_coaching' ? (
                                <div className="space-y-2">
                                    <p><strong className="text-white">Goal:</strong> e.g., Leaving corporate to start a bakery.</p>
                                    <p><strong className="text-white">My Skills:</strong> e.g., Great baker, organized.</p>
                                    <p><strong className="text-white">Constraints:</strong> e.g., Have 1 year of savings.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p><strong className="text-white">Context:</strong> e.g., Series B SaaS startup.</p>
                                    <p><strong className="text-white">Idea:</strong> e.g., Switch to usage-based pricing.</p>
                                    <p><strong className="text-white">Solution:</strong> e.g., 1 credit = 1 API call.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <textarea
              required
              rows={6}
              className="w-full bg-white border border-natural-300 rounded-lg px-4 py-3 text-natural-900 focus:ring-2 focus:ring-natural-500 focus:border-transparent outline-none transition resize-none leading-relaxed placeholder:text-natural-400 shadow-inner whitespace-pre-wrap"
              placeholder={selectedScenario.contextPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            <div className="flex justify-between items-start mt-2">
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-natural-300 hover:bg-natural-50 text-natural-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm">
                        <Paperclip size={14} />
                        Attach Files (PDF, Images)
                        <input type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                      </label>
                      <span className="text-[10px] text-natural-400">Contextual docs</span>
                   </div>
                   
                   {/* File List */}
                   {files.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                       {files.map((f, idx) => (
                         <div key={idx} className="flex items-center gap-1 bg-natural-200 text-natural-800 px-2 py-1 rounded text-[10px] border border-natural-300">
                           <span className="max-w-[120px] truncate">{f.name}</span>
                           <button type="button" onClick={() => removeFile(idx)} className="hover:text-rose-600">
                             <X size={10} />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                </div>

                <div className="flex flex-col items-end">
                    <span className={`text-xs ${wordCount < 20 ? 'text-rose-500' : 'text-natural-500'}`}>
                        {wordCount} words {wordCount < 20 && '(Recommended: 50+)'}
                    </span>
                    {wordCount < 20 && description.length > 0 && (
                        <span className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                            <AlertCircle size={12}/> Detailed prompts yield better debates.
                        </span>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* HIDDEN: Model Selection (Hardcoded to Gemini 3 Pro) */}
        {/* <div className="hidden">...</div> */}

        {/* Agent Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Proponent Selection */}
            <div className="flex flex-col h-[320px]">
                <div className="flex flex-col mb-3">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                            <UserCircle size={16} /> Green Team (Proponent)
                        </label>
                        <div className="relative">
                            <button 
                                type="button"
                                className="text-natural-400 hover:text-emerald-600 transition-colors"
                                onClick={() => setShowProponentInfo(!showProponentInfo)}
                                onMouseEnter={() => setShowProponentInfo(true)}
                                onMouseLeave={() => setShowProponentInfo(false)}
                            >
                                <Info size={14} />
                            </button>
                            {showProponentInfo && (
                                <div className="absolute left-0 top-6 w-64 bg-natural-800 border border-natural-700 rounded-lg p-3 shadow-xl z-50 text-xs text-natural-200">
                                    <strong className="text-emerald-400 block mb-1">Your Representative</strong>
                                    This persona acts as <strong>YOU</strong>. The AI adopts this role's communication style and priorities to advocate <strong>FOR</strong> your product idea.
                                </div>
                            )}
                        </div>
                    </div>
                    <span className="text-[10px] text-natural-500 ml-6">Select the voice that will argue FOR your idea.</span>
                </div>

                <div className="flex-1 bg-natural-50 rounded-lg border border-natural-300 p-2 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-2">
                        {filteredProponents.map((persona) => (
                        <div
                            key={persona.id}
                            onClick={() => setSelectedProponent(persona)}
                            className={`cursor-pointer p-3 rounded-lg border transition-all ${
                            selectedProponent.id === persona.id
                                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                                : 'bg-white border-natural-300 hover:bg-white hover:border-natural-400'
                            }`}
                        >
                            <div className={`font-semibold text-sm ${selectedProponent.id === persona.id ? 'text-emerald-800' : 'text-natural-800'}`}>{persona.name}</div>
                            <div className="text-xs text-natural-500 mt-1 line-clamp-2">{persona.description}</div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Opponent Selection */}
            <div className="flex flex-col h-[320px]">
                <div className="flex flex-col mb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-rose-700 flex items-center gap-2">
                                <Users size={16} /> Red Team (Opponent)
                            </label>
                            <div className="relative">
                                <button 
                                    type="button"
                                    className="text-natural-400 hover:text-rose-600 transition-colors"
                                    onClick={() => setShowOpponentInfo(!showOpponentInfo)}
                                    onMouseEnter={() => setShowOpponentInfo(true)}
                                    onMouseLeave={() => setShowOpponentInfo(false)}
                                >
                                    <Info size={14} />
                                </button>
                                {showOpponentInfo && (
                                    <div className="absolute right-0 md:left-0 top-6 w-64 bg-natural-800 border border-natural-700 rounded-lg p-3 shadow-xl z-50 text-xs text-natural-200">
                                        <strong className="text-rose-400 block mb-1">The Challenger</strong>
                                        This persona acts as the <strong>SKEPTIC</strong>. They will poke holes in your logic based on their specific concerns (e.g. Budget, Tech Debt, UX).
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Internal / External Toggle */}
                        <div className="flex bg-natural-200 rounded-lg p-0.5 border border-natural-300">
                            <button
                            type="button"
                            onClick={() => setOpponentCategory('internal')}
                            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                opponentCategory === 'internal'
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'text-natural-500 hover:text-natural-700'
                            }`}
                            >
                            <Building2 size={12} /> Internal
                            </button>
                            <button
                            type="button"
                            onClick={() => setOpponentCategory('external')}
                            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                opponentCategory === 'external'
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'text-natural-500 hover:text-natural-700'
                            }`}
                            >
                            <Globe size={12} /> External
                            </button>
                        </div>
                    </div>
                    <span className="text-[10px] text-natural-500 ml-6">Select the stakeholder who will challenge you.</span>
                </div>

                <div className="flex-1 bg-natural-50 rounded-lg border border-natural-300 p-2 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-2">
                        {filteredOpponents.length > 0 ? filteredOpponents.map((persona) => (
                        <div
                            key={persona.id}
                            onClick={() => setSelectedOpponent(persona)}
                            className={`cursor-pointer p-3 rounded-lg border transition-all ${
                            selectedOpponent?.id === persona.id
                                ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500'
                                : 'bg-white border-natural-300 hover:bg-white hover:border-natural-400'
                            }`}
                        >
                            <div className={`font-semibold text-sm ${selectedOpponent?.id === persona.id ? 'text-rose-800' : 'text-natural-800'}`}>{persona.name}</div>
                            <div className="text-xs text-natural-500 mt-1 line-clamp-2">{persona.description}</div>
                        </div>
                        )) : (
                            <div className="text-center text-natural-400 text-xs py-10 italic">
                                No specific {opponentCategory} opponents found for this scenario.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Rounds */}
        <div className="pt-2 border-t border-natural-300">
          <label className="block text-sm font-medium text-natural-700 mb-2 flex items-center gap-2">
            <Play size={16} /> Debate Length (Rounds)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="6"
              value={rounds}
              onChange={(e) => setRounds(parseInt(e.target.value))}
              className="w-full h-2 bg-natural-300 rounded-lg appearance-none cursor-pointer accent-natural-600"
            />
            <span className="text-natural-700 font-mono bg-white border border-natural-300 px-3 py-1 rounded text-sm">{rounds}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !selectedOpponent}
          className={`w-full mt-6 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 ${
            isProcessing || !selectedOpponent
              ? 'bg-natural-400 cursor-not-allowed opacity-50' 
              : 'bg-natural-600 hover:bg-natural-700'
          }`}
        >
          {isProcessing ? (
             <>
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
               Initializing Simulation...
             </>
          ) : (
             <>
               <Play size={20} fill="currentColor" />
               Start Simulation
             </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SetupForm;