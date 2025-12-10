
import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // HARDCODED PASSWORD - Change this to whatever you want
  const MASTER_PASSWORD = 'greenroom';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MASTER_PASSWORD) {
      onLogin();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-md mx-auto p-6 animate-fade-in-up">
      <div className="bg-white border border-natural-300 shadow-xl rounded-2xl p-8 w-full text-center">
        <div className="w-16 h-16 bg-natural-900 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
          <Lock size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-natural-900 mb-2">Restricted Access</h2>
        <p className="text-natural-500 mb-8 text-sm">
          Enter the master password to access the logs and configuration.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Master Password"
              className="w-full bg-natural-50 border border-natural-300 rounded-xl px-4 py-3 text-natural-900 focus:ring-2 focus:ring-natural-600 outline-none transition text-center tracking-widest"
              autoFocus
            />
            {error && (
              <div className="absolute -bottom-6 left-0 w-full text-center">
                <span className="text-xs text-rose-500 font-bold flex items-center justify-center gap-1">
                  <ShieldAlert size={12} /> Access Denied
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-natural-900 hover:bg-natural-800 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4"
          >
            Authenticate <ArrowRight size={16} />
          </button>
        </form>

        <button
          onClick={onBack}
          className="mt-6 text-xs text-natural-400 hover:text-natural-600 underline"
        >
          Return to Application
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
