import React from 'react';
import { Shield, BrainCircuit, Target, ArrowRight, Layers, FileText, Users, MessageSquareText, FileBarChart, ClipboardList, CheckSquare } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onAdmin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onAdmin }) => {
  const steps = [
    {
      title: "1. Define Context & Assemble Team",
      description: "Choose from pre-built high-stakes frameworks like Product Ideas or Sales Negotiations. Brief the AI on your specific context, then select your 'Green Team' advocate and your 'Red Team' opponent. There is a large list of individual and hybrid personas to pick from so you are ready to anticipate all the personalities in the room.",
      image: "https://i.ibb.co/XfVk0nLh/Product-View-1.png",
      icon: <Layers className="text-blue-600" size={24} />
    },
    {
      title: "2. Run the Simulation",
      description: "Watch the debate unfold in real-time. The Proponent argues your case while the Opponent ruthlessly probes for weaknesses. An AI Moderator fact-checks every claim to ensure the debate stays grounded in reality.",
      image: "https://i.ibb.co/BHn2hxmc/conversation.png",
      icon: <MessageSquareText className="text-purple-600" size={24} />
    },
    {
      title: "3. Get Actionable Next Steps",
      description: "Receive a prioritized list of action items and evidence required to validate your position. Know exactly what specific data or docs you need to gather before the real meeting.",
      image: "https://i.ibb.co/Gf96m4Yn/Product-View-3.png",
      icon: <CheckSquare className="text-teal-600" size={24} />
    },
    {
      title: "4. Identify Strong Arguments",
      description: "Get a clear breakdown of your strongest points versus the risks. The analysis lets you know exactly what to plan for in advance when it comes to the real thing.",
      image: "https://i.ibb.co/0WbGDHn/Product-View-4.png",
      icon: <ClipboardList className="text-orange-600" size={24} />
    },
    {
      title: "5. Strategic Battle Card",
      description: "Receive the best strategic arguments to put forward come the big day. The system synthesizes the debate into a winning game plan.",
      image: "https://i.ibb.co/MxP1NvS1/Product-View-5.png",
      icon: <FileBarChart className="text-rose-600" size={24} />
    }
  ];

  return (
    <div className="min-h-full bg-natural-100 flex flex-col items-center text-natural-900 font-sans">
      
      {/* Hero Section */}
      <div className="w-full px-6 pt-20 pb-16 md:pt-32 md:pb-24 max-w-5xl mx-auto text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-natural-300 text-natural-600 text-xs font-medium mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Now powered by Gemini 3 Pro
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-natural-900 mb-8 leading-[1.1]">
          Anticipate objections. <br />
          <span className="text-natural-600">Master the conversation.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-natural-600 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Simulate high-stakes conversations against realistic AI personas. Identify gaps in your logic, get fact-checked in real-time, and build a robust strategy before you enter the room.
        </p>
        
        <button
          onClick={onStart}
          className="group bg-natural-900 hover:bg-natural-800 text-white text-lg font-medium py-4 px-10 rounded-2xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 mx-auto transform hover:-translate-y-1"
        >
          Start Simulation
          <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Product Tour / How It Works */}
      <div className="w-full bg-white border-y border-natural-200 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-natural-900 mb-4">How it Works</h2>
            <p className="text-natural-500 max-w-2xl mx-auto">
              From idea to strategy in five simple steps.
            </p>
          </div>

          <div className="space-y-24">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16`}
              >
                {/* Text Content */}
                <div className="flex-1 space-y-4">
                  <div className="w-12 h-12 bg-natural-50 rounded-xl border border-natural-200 flex items-center justify-center shadow-sm">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-natural-800">
                    {step.title}
                  </h3>
                  <p className="text-natural-600 text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Image Showcase */}
                <div className="flex-1 w-full">
                  <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-natural-200 bg-natural-50 ring-1 ring-natural-900/5 aspect-[4/3] md:aspect-auto">
                    {/* Note: Using object-cover for consistency, although screenshots might be better with object-contain depending on aspect ratio */}
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.02]"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback in case viewer links don't work directly
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<div class="w-full h-64 flex items-center justify-center bg-natural-100 text-natural-400 italic text-sm">Image Preview: ${step.title}</div>`;
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-natural-900">Why use The Green Room?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-2xl border border-natural-200 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-700">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-natural-900 mb-3">
              Risk Mitigation
            </h3>
            <p className="text-natural-600 leading-relaxed">
              Uncover blind spots and operational risks in a safe environment. Test your crisis response or strategic pivot without real-world consequences.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-natural-200 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-700">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold text-natural-900 mb-3">
              Savage Opposition
            </h3>
            <p className="text-natural-600 leading-relaxed">
              The Red Team personas are savage. They will do their very best to challenge you, ensuring you are as ready as possible for the rigorous questioning in the room.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-natural-200 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6 text-purple-700">
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-xl font-bold text-natural-900 mb-3">
              Objective Analysis
            </h3>
            <p className="text-natural-600 leading-relaxed">
              Receive a synthesized verdict from a neutral verifier. Get a calculated probability of success and a battle card of required evidence.
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-natural-900 text-natural-400 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-center">
          <p className="text-sm">
            Secure. Private. Local storage only.
          </p>
          <button 
            onClick={onAdmin} 
            className="text-xs hover:text-white transition-colors opacity-60 hover:opacity-100"
          >
            Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;