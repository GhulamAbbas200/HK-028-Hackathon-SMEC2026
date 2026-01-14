
import React from 'react';
import { Task, User } from '../types';

interface TaskCardProps {
  task: Task;
  currentUser: User | null;
  onBid: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, currentUser, onBid }) => {
  const isOwner = currentUser?.id === task.clientId;
  const hasBid = task.bids.some(b => b.bidderId === currentUser?.id);
  const isUrgent = new Date(task.deadline).getTime() - Date.now() < 86400000 * 3;

  return (
    <div className="group relative bg-white rounded-[2.5rem] border border-slate-200 p-7 flex flex-col h-full transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.12)]">
      {/* Visual Status */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200/50">
            {task.category}
          </span>
          {isUrgent && (
            <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase rounded-lg border border-amber-100 flex items-center gap-1">
              <i className="fa-solid fa-clock text-[7px]"></i> Urgent
            </span>
          )}
        </div>
        <div className="bg-indigo-600 px-4 py-2 rounded-2xl shadow-lg shadow-indigo-100">
           <span className="text-lg font-black text-white">${task.budget}</span>
        </div>
      </div>
      
      <div className="flex-1 space-y-3">
        <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
          {task.title}
        </h3>
        <p className="text-slate-500 text-sm font-medium line-clamp-3 leading-relaxed opacity-80">
          {task.description}
        </p>
      </div>

      {/* Dynamic Activity */}
      <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
        <div className="flex -space-x-2">
          {task.bids.slice(0, 3).map((b, i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase shadow-sm">
              {b.bidderName[0]}
            </div>
          ))}
          {task.bids.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-slate-50 flex items-center justify-center text-[8px] font-bold text-slate-600">
              +{task.bids.length - 3}
            </div>
          )}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {task.bids.length === 0 ? 'Be the first to bid' : `${task.bids.length} active proposals`}
        </span>
      </div>

      <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img 
            src={`https://picsum.photos/seed/${task.clientId}/64/64`} 
            alt="client" 
            className="w-9 h-9 object-cover rounded-xl border border-slate-200 bg-slate-50" 
          />
          <div>
            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Posted by</span>
            <span className="text-xs font-extrabold text-slate-800">{task.clientName}</span>
          </div>
        </div>

        {!isOwner && currentUser?.role === 'STUDENT' && (
          <button 
            disabled={hasBid}
            onClick={(e) => { e.stopPropagation(); onBid(); }}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${hasBid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-600 hover:translate-y-[-2px] active:scale-95 shadow-lg'}`}
          >
            {hasBid ? 'Proposal Sent' : 'Bid Now'}
          </button>
        )}

        {isOwner && (
          <div className="px-3 py-2 bg-indigo-50 text-indigo-500 text-[9px] font-black uppercase rounded-lg border border-indigo-100">
            Manage
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
