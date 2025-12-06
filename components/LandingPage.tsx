
import React from 'react';
import { Shield, BrainCircuit, Target, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onAdmin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onAdmin }) => {
  return (
    <div className="min-h-screen bg-natural-100 flex flex-col justify-center items-center p-6 text-natural-900 font-sans">
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-natural-300 text-natural-600 text-xs font-medium mb-6 shadow-sm">
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-natural-900 mb-6 leading-tight">
          Anticipate objections. <br />
          Refine your strategy.
        </h1>
        
        <p className="text-lg md:text-xl text-natural-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Debate Planner simulates high-stakes conversations against realistic AI personas. Identify gaps in your logic and validate your approach before entering the room.
        </p>
        
        <button
          onClick={onStart}
          className="group bg-natural-900 hover:bg-natural-800 text-white text-lg font-medium py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mx-auto"
        >
          Launch Planner
          <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full px-4 mb-20">
        
        {/* Benefit 1 */}
        <div className="bg-white p-8 rounded-xl border border-natural-300 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-natural-100 rounded-lg flex items-center justify-center mb-6 text-natural-700">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold text-natural-900 mb-3">
            Risk Mitigation
          </h3>
          <p className="text-natural-600 leading-relaxed">
            Uncover blind spots and operational risks in a safe environment. Test your crisis response or strategic pivot without real-world consequences.
          </p>
        </div>

        {/* Benefit 2 */}
        <div className="bg-white p-8 rounded-xl border border-natural-300 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-natural-100 rounded-lg flex items-center justify-center mb-6 text-natural-700">
            <Target size={24} />
          </div>
          <h3 className="text-xl font-bold text-natural-900 mb-3">
            Targeted Preparation
          </h3>
          <p className="text-natural-600 leading-relaxed">
            Select specific personas relevant to your objective. Practice against skepticism from internal stakeholders or pricing objections from procurement.
          </p>
        </div>

        {/* Benefit 3 */}
        <div className="bg-white p-8 rounded-xl border border-natural-300 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-natural-100 rounded-lg flex items-center justify-center mb-6 text-natural-700">
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

      {/* Footer / Outcomes */}
      <div className="border-t border-natural-300 pt-10 pb-10 text-center w-full max-w-4xl flex flex-col items-center gap-2">
        <p className="text-natural-500 text-sm">
          Secure. Private. Local storage only.
        </p>
        <button 
          onClick={onAdmin} 
          className="text-[10px] text-natural-300 hover:text-natural-500 transition-colors"
        >
          Admin
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
