
import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { suggestCategory } from '../services/gemini';

interface CreateTaskProps {
  onPost: (data: any) => void;
}

const CreateTask: React.FC<CreateTaskProps> = ({ onPost }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    budget: '',
    deadline: ''
  });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSuggestingCat, setIsSuggestingCat] = useState(false);

  const handleSuggestCategory = async () => {
    if (!formData.title || !formData.description) return;
    setIsSuggestingCat(true);
    const suggested = await suggestCategory(formData.title, formData.description);
    if (CATEGORIES.includes(suggested)) {
      setFormData(prev => ({ ...prev, category: suggested }));
    }
    setIsSuggestingCat(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEnhancing(true);
    await onPost(formData);
    setIsEnhancing(false);
  };

  return (
    <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-200 depth-shadow animate-slide-up">
      <div className="text-center mb-14">
        <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-8 shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50">
          <i className="fa-solid fa-rocket"></i>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Launch a New Gig</h1>
        <p className="text-slate-500 font-medium text-lg">Detailed scoping leads to better student results.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Gig Headline</label>
          <input 
            type="text" 
            placeholder="e.g. Need Python tutor for final project preparation"
            required
            className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-xl placeholder:text-slate-300"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Type</label>
              <button 
                type="button"
                onClick={handleSuggestCategory}
                className="text-indigo-600 text-[10px] font-black uppercase flex items-center gap-1.5 hover:text-indigo-800 transition-colors"
              >
                {isSuggestingCat ? (
                  <i className="fa-solid fa-spinner animate-spin"></i>
                ) : (
                  <><i className="fa-solid fa-wand-sparkles"></i> AI Categorize</>
                )}
              </button>
            </div>
            <select 
              className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none cursor-pointer font-black text-xs uppercase tracking-widest text-slate-600"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Budget (USD)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                required
                className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-black text-xl"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline Date</label>
          <input 
            type="date" 
            required
            className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-xs uppercase tracking-widest text-slate-600"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Requirements & Deliverables</label>
          <textarea 
            placeholder="List exactly what you need. Be specific about tools, file formats, or specific outcomes..."
            rows={6}
            required
            className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-base leading-relaxed"
            style={{ resize: 'none' }}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
          <div className="flex items-center gap-4 p-5 bg-indigo-50 rounded-[1.5rem] border border-indigo-100">
            <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
               <i className="fa-solid fa-sparkles"></i>
            </div>
            <p className="text-xs font-bold text-indigo-700 leading-snug">Gemini AI will automatically refine your requirements for maximum clarity before posting.</p>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isEnhancing}
          className="w-full bg-slate-900 text-white py-6 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4"
        >
          {isEnhancing ? (
            <><i className="fa-solid fa-spinner animate-spin"></i> Processing...</>
          ) : (
            <>Post to Network <i className="fa-solid fa-paper-plane text-[10px]"></i></>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateTask;
