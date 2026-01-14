
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AuthProps {
  onAuthComplete: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthComplete }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usersJson = localStorage.getItem('unigig_all_users');
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onAuthComplete(user);
      } else {
        alert("Verification failed. Check your university credentials.");
      }
    } else {
      if (users.some(u => u.email === email)) {
        alert("This campus email is already registered!");
        return;
      }
      const newUser: User = {
        id: `u${Date.now()}`,
        name,
        email,
        password,
        role,
        avatar: `https://picsum.photos/seed/${name}/200/200`,
        bio: role === 'STUDENT' ? 'Dedicated campus talent ready for meaningful projects.' : 'Looking for high-caliber student contributors.',
        rating: 5.0,
        completedTasks: 0,
        skills: role === 'STUDENT' ? ['Entry Level Talent'] : [],
        earnings: 0
      };
      users.push(newUser);
      localStorage.setItem('unigig_all_users', JSON.stringify(users));
      onAuthComplete(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border border-slate-100 overflow-hidden animate-slide-up">
        <div className="bg-indigo-600 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/30">
              <i className="fa-solid fa-graduation-cap text-white text-3xl"></i>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">UniGig</h2>
            <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest mt-2 opacity-80">Campus Talent Exchange</p>
          </div>
        </div>

        <div className="p-8 md:p-10 space-y-8">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Purpose</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setRole('STUDENT')}
                      className={`py-4 rounded-2xl border-2 font-bold text-xs uppercase transition-all flex flex-col items-center gap-2 ${role === 'STUDENT' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-inner' : 'border-slate-100 text-slate-400 bg-slate-50 hover:border-slate-200'}`}
                    >
                      <i className="fa-solid fa-user-graduate text-lg"></i>
                      Talent
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRole('CLIENT')}
                      className={`py-4 rounded-2xl border-2 font-bold text-xs uppercase transition-all flex flex-col items-center gap-2 ${role === 'CLIENT' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-inner' : 'border-slate-100 text-slate-400 bg-slate-50 hover:border-slate-200'}`}
                    >
                      <i className="fa-solid fa-user-tie text-lg"></i>
                      Hirer
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" required placeholder="John Doe" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">University Email</label>
              <input type="email" required placeholder="name@uni.edu" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
              <input type="password" required placeholder="••••••••" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest mt-4 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
              {isLogin ? 'Access Marketplace' : 'Create Account'}
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Secured with University SSO Standard v2.1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
