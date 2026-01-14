
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  activeView: string;
  onSwitchView: (view: 'BOARD' | 'POST' | 'PROFILE') => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, activeView, onSwitchView, onLogout }) => {
  return (
    <nav className="sticky top-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => onSwitchView('BOARD')}
          >
            <div className="bg-indigo-600 text-white w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center font-black text-lg md:text-xl shadow-lg shadow-indigo-600/20 group-hover:rotate-6 transition-all duration-300">
              U
            </div>
            <div>
              <span className="block font-black text-lg md:text-xl text-slate-900 tracking-tight leading-none">UniGig</span>
              <span className="hidden sm:block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Campus Network</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-slate-100/60 p-1 rounded-2xl border border-slate-200/40">
            {[
              { id: 'BOARD', label: 'Explore', icon: 'fa-compass' },
              { id: 'POST', label: 'Post Gig', icon: 'fa-plus-circle', clientOnly: true },
              { id: 'PROFILE', label: 'Command Center', icon: 'fa-rocket' }
            ].map((item) => {
              if (item.clientOnly && user?.role !== 'CLIENT') return null;
              const active = activeView === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => onSwitchView(item.id as any)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${active ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <i className={`fa-solid ${item.icon} ${active ? 'text-indigo-500' : 'opacity-40'}`}></i>
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden sm:flex flex-col items-end">
               <span className="text-sm font-bold text-slate-900 leading-none">{user?.name}</span>
               <span className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-tighter mt-1">{user?.role}</span>
            </div>
            
            <div className="relative group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl p-0.5 bg-gradient-to-br from-indigo-500 to-violet-500 ring-2 ring-transparent group-hover:ring-indigo-100 transition-all cursor-pointer">
                <img 
                  src={user?.avatar} 
                  alt="avatar" 
                  className="w-full h-full rounded-[0.9rem] object-cover bg-white"
                  onClick={() => onSwitchView('PROFILE')}
                />
              </div>
              <div className="absolute right-0 top-full mt-3 w-52 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 transform translate-y-2 group-hover:translate-y-0 z-[110]">
                 <div className="px-3 py-2 mb-1 border-b border-slate-100 md:hidden">
                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                    <p className="text-[10px] font-medium text-slate-400">{user?.email}</p>
                 </div>
                 <button onClick={() => onSwitchView('PROFILE')} className="w-full text-left p-3 rounded-xl hover:bg-slate-50 font-semibold text-xs flex items-center gap-3 transition-colors">
                   <i className="fa-solid fa-circle-user text-slate-400"></i> My Profile
                 </button>
                 <button onClick={onLogout} className="w-full text-left p-3 rounded-xl hover:bg-red-50 text-red-600 font-semibold text-xs flex items-center gap-3 transition-colors">
                   <i className="fa-solid fa-arrow-right-from-bracket opacity-70"></i> Logout
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
