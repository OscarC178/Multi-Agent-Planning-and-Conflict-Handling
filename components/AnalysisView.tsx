
import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle, AlertTriangle, XCircle, Shield, TrendingUp, AlertOctagon, ClipboardList, RefreshCw, MessageSquarePlus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnalysisViewProps {
  result: AnalysisResult;
  onReset: () => void;
  onContinue: (evidence: string) => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onReset, onContinue }) => {
  const [evidence, setEvidence] = useState('');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-rose-600';
  };

  const chartData = [
    { name: 'Viability', value: result.viabilityScore },
    { name: 'Gap', value: 100 - result.viabilityScore }
  ];

  // Determine label based on context (hack: infer from battle card content or just use generic if not passed via props, 
  // but for now "Viability/Deal Prob" covers bases)
  const scoreLabel = "Viability / Deal Probability";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-natural-300 p-6 shadow-xl flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-natural-800 mb-2 flex items-center gap-3">
            <Shield className="text-natural-600" size={32} />
            Verdict Rendered
          </h2>
          <p className="text-natural-600 text-lg leading-relaxed">
            {result.viabilityReasoning}
          </p>
        </div>
        
        {/* Score Circle */}
        <div className="relative w-40 h-40 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        innerRadius={50}
                        outerRadius={70}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                         <Cell fill={result.viabilityScore >= 50 ? (result.viabilityScore >= 80 ? '#34d399' : '#facc15') : '#fb7185'} />
                         <Cell fill="#E0DFD8" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(result.viabilityScore)}`}>{result.viabilityScore}%</span>
                <span className="text-xs text-natural-500 uppercase tracking-wider text-center px-2">{scoreLabel}</span>
            </div>
        </div>
      </div>

      {/* Action Points / Evidence Required */}
      <div className="bg-white rounded-xl border border-natural-300 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-natural-300"></div>
        <h3 className="text-xl font-bold text-natural-800 mb-4 flex items-center gap-2">
            <ClipboardList size={20} className="text-natural-600"/> Action Items & Evidence Required
        </h3>
        <div className="grid grid-cols-1 gap-3">
            {result.battleCard.actionPoints && result.battleCard.actionPoints.length > 0 ? (
                result.battleCard.actionPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3 text-natural-700 bg-natural-50 p-3 rounded-lg border border-natural-200">
                        <span className="font-mono text-natural-600 font-bold">{i+1}.</span>
                        <span>{point}</span>
                    </div>
                ))
            ) : (
                <p className="text-natural-400 italic">No specific validation actions identified.</p>
            )}
        </div>
      </div>

      {/* Continue Debate Section */}
      <div className="bg-white border border-natural-300 p-6 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                  <h3 className="text-lg font-bold text-natural-800 flex items-center gap-2 mb-2">
                      <MessageSquarePlus size={20} className="text-natural-600" />
                      Continue Simulation
                  </h3>
                  <p className="text-sm text-natural-500 mb-4">
                      Address the action points above or add new context to avoid circular arguments. 
                      This will run 2 additional rounds and generate a new analysis.
                  </p>
                  <textarea 
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="e.g., 'We have a confirmed budget of $50k' or 'Here is the latency benchmark data...'"
                    className="w-full bg-natural-50 border border-natural-300 rounded-lg p-3 text-sm text-natural-800 focus:ring-2 focus:ring-natural-500 outline-none resize-none h-24"
                  />
              </div>
              <div className="flex items-end">
                   <button
                     onClick={() => onContinue(evidence)}
                     className="w-full md:w-auto bg-natural-600 hover:bg-natural-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-natural-600 shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                   >
                     <RefreshCw size={18} /> Add Evidence & Continue
                   </button>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Battle Card: Strengths & Weaknesses */}
        <div className="bg-white rounded-xl border border-natural-300 p-6 shadow-xl">
           <h3 className="text-xl font-bold text-natural-800 mb-4 flex items-center gap-2">
             <TrendingUp size={20} className="text-emerald-600"/> Product Strengths
           </h3>
           <ul className="space-y-3">
             {result.battleCard.strengths.map((s, i) => (
               <li key={i} className="flex gap-3 text-natural-600 text-sm">
                 <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                 {s}
               </li>
             ))}
           </ul>
        </div>

        <div className="bg-white rounded-xl border border-natural-300 p-6 shadow-xl">
           <h3 className="text-xl font-bold text-natural-800 mb-4 flex items-center gap-2">
             <AlertOctagon size={20} className="text-rose-500"/> Critical Gaps
           </h3>
           <ul className="space-y-3">
             {result.gaps.map((g, i) => (
               <li key={i} className="flex gap-3 text-natural-600 text-sm">
                 <XCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
                 {g}
               </li>
             ))}
           </ul>
        </div>

      </div>

      {/* Counter Arguments */}
      <div className="bg-white rounded-xl border border-natural-300 p-6 shadow-xl">
        <h3 className="text-xl font-bold text-natural-800 mb-4 flex items-center gap-2">
             <AlertTriangle size={20} className="text-yellow-500"/> Strategic Counter-Arguments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.battleCard.counterArguments.map((arg, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-natural-300 hover:border-natural-400 transition shadow-sm">
                    <p className="text-natural-700 text-sm italic">"{arg}"</p>
                </div>
            ))}
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <button
          onClick={onReset}
          className="bg-white hover:bg-natural-50 text-natural-700 font-semibold py-3 px-8 rounded-lg transition-colors border border-natural-300 shadow-md"
        >
          Run New Simulation
        </button>
      </div>
    </div>
  );
};

export default AnalysisView;
