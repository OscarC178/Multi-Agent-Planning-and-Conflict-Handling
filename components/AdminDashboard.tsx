
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw, Database } from 'lucide-react';
import { fetchLogs, initSupabase } from '../services/loggingService';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'feedback' | 'logs'>('feedback');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Settings for connection
  const [supaUrl, setSupaUrl] = useState('');
  const [supaKey, setSupaKey] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    const data = await fetchLogs();
    setLogs(data);
    setLoading(false);
  };

  const handleConnect = () => {
     if(supaUrl && supaKey) {
         initSupabase(supaUrl, supaKey);
         loadLogs();
     }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
        loadLogs();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-natural-100 p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-xl border border-natural-300 p-8">
        
        <div className="flex justify-between items-center mb-6">
             <button onClick={onBack} className="p-2 hover:bg-natural-200 rounded-full transition-colors flex items-center gap-2 text-natural-600">
               <ArrowLeft size={20}/> Back
             </button>
             <h1 className="text-2xl font-bold text-natural-900">Admin Dashboard</h1>
        </div>

        <div className="flex gap-4 border-b border-natural-300 mb-6">
            <button 
                onClick={() => setActiveTab('feedback')}
                className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'feedback' ? 'text-natural-900 border-b-2 border-natural-900' : 'text-natural-500'}`}
            >
                Feedback Forms
            </button>
            <button 
                onClick={() => setActiveTab('logs')}
                className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'logs' ? 'text-natural-900 border-b-2 border-natural-900' : 'text-natural-500'}`}
            >
                Live User Logs
            </button>
        </div>

        {activeTab === 'feedback' && (
            <div className="text-center py-10">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-lg mx-auto">
                    <h2 className="text-lg font-bold text-blue-800 mb-2">Feedback System</h2>
                    <p className="text-blue-700 text-sm">
                        User feedback is collected via external Google Forms.
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
            </div>
        )}

        {activeTab === 'logs' && (
            <div className="space-y-4">
                {/* Configuration for first time setup */}
                <div className="bg-natural-50 p-4 rounded-lg border border-natural-200 mb-4">
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                        <Database size={16}/> Connect to Supabase (Required for Logs)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input 
                            type="text" 
                            placeholder="Supabase URL (https://xyz.supabase.co)" 
                            value={supaUrl}
                            onChange={(e) => setSupaUrl(e.target.value)}
                            className="border border-natural-300 rounded px-3 py-1 text-sm"
                        />
                        <input 
                            type="password" 
                            placeholder="Supabase Anon Key" 
                            value={supaKey}
                            onChange={(e) => setSupaKey(e.target.value)}
                            className="border border-natural-300 rounded px-3 py-1 text-sm"
                        />
                    </div>
                    <button 
                        onClick={handleConnect}
                        className="bg-natural-800 text-white text-xs px-3 py-2 rounded hover:bg-natural-700"
                    >
                        Save & Connect
                    </button>
                </div>

                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-natural-800">Recent Activity</h3>
                    <button onClick={loadLogs} className="p-2 hover:bg-natural-100 rounded text-natural-600" title="Refresh">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                <div className="border border-natural-300 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-natural-100 text-natural-600 font-medium border-b border-natural-300">
                            <tr>
                                <th className="p-3">Time</th>
                                <th className="p-3">Action</th>
                                <th className="p-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-natural-200">
                            {logs.length > 0 ? logs.map((log) => (
                                <tr key={log.id} className="hover:bg-natural-50">
                                    <td className="p-3 text-natural-500 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleTimeString()}
                                    </td>
                                    <td className="p-3 font-medium text-natural-800">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            log.action_type === 'START_SIMULATION' ? 'bg-blue-100 text-blue-700' :
                                            log.action_type === 'ANALYSIS_COMPLETE' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {log.action_type}
                                        </span>
                                    </td>
                                    <td className="p-3 text-natural-600 max-w-xs truncate">
                                        {JSON.stringify(log.payload)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-natural-400">
                                        No logs found. Connect Supabase above to start tracking.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
