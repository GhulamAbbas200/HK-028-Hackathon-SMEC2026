
import React, { useState } from 'react';
import { Task } from '../types';

interface BidModalProps {
  task: Task;
  onClose: () => void;
  onSubmit: (data: { amount: number; timeframe: string; message: string }) => void;
}

const BidModal: React.FC<BidModalProps> = ({ task, onClose, onSubmit }) => {
  const [amount, setAmount] = useState(task.budget);
  const [timeframe, setTimeframe] = useState('1 week');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ amount, timeframe, message });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
        <div className="bg-indigo-600 p-8 text-white relative">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-full transition-colors flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <h2 className="text-2xl font-black mb-1">Apply for Gig</h2>
          <p className="text-indigo-100 text-sm font-medium opacity-90 truncate max-w-[80%]">{task.title}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Proposed Fee (USD)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
              <input 
                type="number" 
                required
                className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estimated Turnaround</label>
            <input 
              type="text" 
              placeholder="e.g. 2-3 Days"
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-sm"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message to Client</label>
            <textarea 
              placeholder="Briefly explain your relevant skills and availability..."
              required
              rows={4}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm leading-relaxed"
              style={{ minHeight: '120px', resize: 'none' }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 font-bold uppercase text-xs rounded-2xl hover:bg-slate-200 transition-colors">Dismiss</button>
            <button type="submit" className="flex-[2] px-6 py-4 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">Send Proposal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BidModal;
