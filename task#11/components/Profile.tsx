
import React, { useState, useEffect } from 'react';
import { User, Task, Bid } from '../types';
import { analyzePortfolioSkills } from '../services/gemini';

interface ProfileProps {
  user: User;
  tasks: Task[];
  onCompleteTask: (id: string, review?: string) => void;
  onAcceptBid: (taskId: string, bid: Bid) => void;
  onSubmitForReview: (taskId: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, tasks, onCompleteTask, onAcceptBid, onSubmitForReview }) => {
  const [aiSkills, setAiSkills] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [activeReviewTask, setActiveReviewTask] = useState<string | null>(null);

  const completedTasks = tasks.filter(t => (t.assignedStudentId === user.id || t.clientId === user.id) && t.status === 'COMPLETED');
  const tasksOwnedByClient = tasks.filter(t => t.clientId === user.id);
  const activeTasks = tasks.filter(t => (t.assignedStudentId === user.id || t.clientId === user.id) && (t.status === 'IN_PROGRESS' || t.status === 'UNDER_REVIEW'));

  useEffect(() => {
    if (user.role === 'STUDENT' && completedTasks.length > 0) {
      setIsAnalyzing(true);
      analyzePortfolioSkills(completedTasks.map(t => ({ title: t.title, description: t.description })))
        .then(skills => {
          setAiSkills(skills);
          setIsAnalyzing(false);
        });
    }
  }, [completedTasks.length, user.role]);

  const StatusStepper = ({ status }: { status: string }) => {
    const stages = ['Hired', 'Working', 'Review', 'Paid'];
    const currentIdx = status === 'IN_PROGRESS' ? 1 : status === 'UNDER_REVIEW' ? 2 : status === 'COMPLETED' ? 3 : 0;
    
    return (
      <div className="flex items-center gap-2 mt-4">
        {stages.map((stage, i) => (
          <React.Fragment key={stage}>
            <div className={`flex flex-col items-center gap-1.5`}>
              <div className={`w-2.5 h-2.5 rounded-full border-2 ${i <= currentIdx ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]' : 'bg-slate-100 border-slate-200'}`}></div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${i <= currentIdx ? 'text-indigo-600' : 'text-slate-300'}`}>{stage}</span>
            </div>
            {i < stages.length - 1 && <div className={`flex-1 h-[1px] mb-4 min-w-[15px] ${i < currentIdx ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-6xl mx-auto pb-20">
      {/* Identity Profile */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-200 depth-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 -skew-x-12 translate-x-1/2"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] p-2 bg-white border border-slate-100 shadow-2xl transition-transform duration-500 group-hover:scale-105">
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-[2.5rem] object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
               <i className={`fa-solid ${user.role === 'STUDENT' ? 'fa-user-graduate' : 'fa-briefcase'} text-lg`}></i>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg mb-4 border border-indigo-100">
               Campus Verified Student
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">{user.name}</h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">{user.bio}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-10">
              {[
                { label: 'Platform Revenue', value: `$${user.earnings}`, icon: 'fa-vault' },
                { label: 'Gig Volume', value: `${user.completedTasks}`, icon: 'fa-rocket' },
                { label: 'Global Rank', value: `${user.rating * 20}%`, icon: 'fa-trophy' }
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  <div className="flex items-center gap-2.5">
                    <i className={`fa-solid ${stat.icon} text-indigo-500/60`}></i>
                    <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Active Operations */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                   <i className="fa-solid fa-list-check text-xs"></i>
                </div>
                Active Missions
              </h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">Real-time status</span>
            </div>

            <div className="space-y-6">
              {activeTasks.length === 0 && (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No ongoing projects</p>
                </div>
              )}
              {activeTasks.map(t => (
                <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 depth-shadow-hover transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="space-y-2">
                       <h4 className="text-xl font-black text-slate-900 leading-none">{t.title}</h4>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.category} • Budget ${t.budget}</p>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-1">
                       <StatusStepper status={t.status} />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-50">
                    {user.role === 'STUDENT' && t.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => onSubmitForReview(t.id)} 
                        className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                      >
                        Submit for Payment
                      </button>
                    )}
                    {user.role === 'CLIENT' && t.status === 'UNDER_REVIEW' && (
                      <div className="w-full space-y-4">
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                           <i className="fa-solid fa-circle-info text-emerald-500"></i>
                           <span className="text-xs font-bold text-emerald-700">Student is awaiting review. Please verify deliverables.</span>
                        </div>
                        <div className="flex gap-3">
                           <button 
                             onClick={() => setActiveReviewTask(t.id)} 
                             className="flex-1 px-8 py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all"
                           >
                             Release Funds & Complete
                           </button>
                        </div>
                      </div>
                    )}
                    {t.status === 'UNDER_REVIEW' && user.role === 'STUDENT' && (
                       <div className="flex items-center gap-3 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                          <i className="fa-solid fa-spinner animate-spin text-sm"></i>
                          <span className="text-xs font-black uppercase tracking-widest">Client Reviewing...</span>
                       </div>
                    )}
                  </div>

                  {activeReviewTask === t.id && (
                    <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-200 animate-slide-up">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Leave feedback for the portfolio</label>
                       <textarea 
                         placeholder="e.g. Exceptional coding skills, finished ahead of schedule!"
                         className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all mb-4"
                         rows={2}
                         value={reviewText}
                         onChange={(e) => setReviewText(e.target.value)}
                       />
                       <div className="flex gap-2">
                          <button onClick={() => { onCompleteTask(t.id, reviewText); setActiveReviewTask(null); }} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest">Post & Release</button>
                          <button onClick={() => setActiveReviewTask(null)} className="px-6 py-3 bg-slate-200 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest">Cancel</button>
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Portfolio History */}
          <section className="pt-10">
            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center">
                 <i className="fa-solid fa-award text-xs"></i>
              </div>
              Platform Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {completedTasks.length === 0 && (
                 <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic">No achievements yet. Complete your first gig!</p>
                 </div>
              )}
              {completedTasks.map(t => (
                <div key={t.id} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 depth-shadow group hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                     <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-lg border border-emerald-100">Verified Work</span>
                     <span className="text-lg font-black text-slate-900">${t.budget}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 mb-2 leading-tight">{t.title}</h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                     <p className="text-xs text-slate-500 italic leading-relaxed">"{t.review || "The hirer was happy with the work!"}"</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <span>{t.category}</span>
                     <div className="flex gap-0.5 text-amber-400">
                        {[1,2,3,4,5].map(s => <i key={s} className="fa-solid fa-star"></i>)}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Dynamic Sidebar */}
        <div className="space-y-10">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
             <h3 className="text-xl font-black mb-10 flex items-center gap-3">
                <i className="fa-solid fa-chart-line text-indigo-400"></i> Platform Pulse
             </h3>
             <div className="space-y-8">
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                      <span>Trust Factor</span>
                      <span>{user.rating * 20}%</span>
                   </div>
                   <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 w-full" style={{ width: `${user.rating * 20}%` }}></div>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-center">
                      <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Completion</span>
                      <span className="text-2xl font-black text-white">100%</span>
                   </div>
                   <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-center">
                      <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Rank</span>
                      <span className="text-2xl font-black text-white">MVP</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 depth-shadow">
            <h3 className="text-xl font-black mb-8 text-slate-900 flex items-center gap-3">
               Verified Expertise
               {isAnalyzing && <i className="fa-solid fa-sparkles text-indigo-500 animate-pulse text-xs"></i>}
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {user.skills.map(skill => (
                <span key={skill} className="px-5 py-3 bg-slate-50 rounded-2xl text-xs font-black text-slate-700 border border-slate-100">
                  {skill}
                </span>
              ))}
              {aiSkills.map(skill => (
                <span key={skill} className="px-5 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black border border-indigo-100 flex items-center gap-2 shadow-sm animate-fade-in">
                  <i className="fa-solid fa-shield-halved opacity-40"></i>
                  {skill}
                </span>
              ))}
              {isAnalyzing && <div className="w-full h-12 bg-slate-50 rounded-2xl animate-shimmer"></div>}
            </div>
            {aiSkills.length > 0 && (
               <div className="mt-10 p-5 bg-indigo-600 text-white rounded-[2rem] text-center shadow-xl shadow-indigo-100">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2">AI Career Insight</p>
                  <p className="text-xs font-bold opacity-90 leading-relaxed">"Demonstrates strong project ownership and high-level proficiency in technical execution."</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
