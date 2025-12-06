import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-natural-100 p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl border border-natural-300 p-8 text-center">
        
        <div className="flex justify-start mb-6">
             <button onClick={onBack} className="p-2 hover:bg-natural-200 rounded-full transition-colors">
               <ArrowLeft size={24} className="text-natural-600"/>
             </button>
        </div>

        <h1 className="text-3xl font-bold text-natural-900 mb-4">Admin Dashboard</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-blue-800 mb-2">Feedback System Updated</h2>
            <p className="text-blue-700">
                User feedback is now collected via an external Google Form to ensure reliability.
            </p>
        </div>

        <a 
            href="https://docs.google.com/forms/d/1Xy_.../edit" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-natural-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-natural-700 transition-colors shadow-lg"
        >
            <ExternalLink size={20} />
            View Responses (Google Forms)
        </a>
        
        <p className="mt-8 text-sm text-natural-500">
            Link to form: <br/>
            <span className="font-mono bg-natural-100 px-2 py-1 rounded">https://forms.gle/fgxppMaEjFRM1cri9</span>
        </p>

      </div>
    </div>
  );
};

export default AdminDashboard;