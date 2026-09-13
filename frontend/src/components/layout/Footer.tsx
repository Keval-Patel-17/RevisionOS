import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span><b>Grounded in your material:</b> All notes and quiz questions cite specific pages or sections.</span>
        </div>
        
        <div className="flex items-center space-x-2 text-slate-500">
          <Info className="w-3.5 h-3.5" />
          <span>AI can make mistakes. Verify important academic formulas against your lecture source.</span>
        </div>
      </div>
    </footer>
  );
};
