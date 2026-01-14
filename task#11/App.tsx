
import React, { useState, useEffect, useMemo } from 'react';
import { User, Task, Bid, TaskStatus, AppNotification } from './types';
import { MOCK_USERS, INITIAL_TASKS, CATEGORIES } from './constants';
import Navbar from './components/Navbar';
import TaskBoard from './components/TaskBoard';
import CreateTask from './components/CreateTask';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { enhanceTaskDescription } from './services/gemini';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('unigig_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('unigig_tasks');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('unigig_all_users', JSON.stringify(MOCK_USERS));
    return INITIAL_TASKS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeView, setActiveView] = useState<'BOARD' | 'POST' | 'PROFILE'>('BOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem('unigig_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('unigig_session', JSON.stringify(currentUser));
      const usersJson = localStorage.getItem('unigig_all_users');
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      const index = users.findIndex(u => u.id === currentUser.id);
      if (index !== -1) {
        users[index] = currentUser;
      }
      localStorage.setItem('unigig_all_users', JSON.stringify(users));
    } else {
      localStorage.removeItem('unigig_session');
    }
  }, [currentUser]);

  const addNotification = (message: string, type: 'INFO' | 'SUCCESS' | 'ALERT' = 'INFO') => {
    const newNote: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now()
    };
    setNotifications(prev => [newNote, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNote.id));
    }, 4000);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;
      return matchesSearch && matchesCategory && task.status === 'OPEN';
    }).sort((a,b) => b.createdAt - a.createdAt);
  }, [tasks, searchQuery, categoryFilter]);

  const handlePostTask = async (taskData: Partial<Task>) => {
    if (!currentUser) return;
    const enhancedDesc = await enhanceTaskDescription(taskData.title || '', taskData.description || '');
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: taskData.title || '',
      description: enhancedDesc,
      category: taskData.category || 'Other',
      budget: Number(taskData.budget) || 0,
      deadline: taskData.deadline || '',
      status: 'OPEN',
      clientId: currentUser.id,
      clientName: currentUser.name,
      bids: [],
      createdAt: Date.now()
    };
    setTasks([newTask, ...tasks]);
    setActiveView('BOARD');
    addNotification("Gig listed! Funds escrowed safely.", "SUCCESS");
  };

  const handlePlaceBid = (taskId: string, bidData: any) => {
    if (!currentUser) return;
    const newBid: Bid = {
      id: `b${Date.now()}`,
      taskId,
      bidderId: currentUser.id,
      bidderName: currentUser.name,
      createdAt: Date.now(),
      ...bidData
    };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, bids: [...t.bids, newBid] } : t));
    addNotification("Proposal sent! Hirer notified.", "SUCCESS");
  };

  const handleAcceptBid = (taskId: string, bid: Bid) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { 
        ...t, 
        status: 'IN_PROGRESS' as TaskStatus, 
        assignedStudentId: bid.bidderId 
      } : t
    ));
    addNotification(`Gig started! ${bid.bidderName} is on it.`, "SUCCESS");
  };

  const handleSubmitForReview = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'UNDER_REVIEW' as TaskStatus } : t));
    addNotification("Submitted for review!", "INFO");
  };

  const handleCompleteTask = (taskId: string, reviewText?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'COMPLETED' as TaskStatus, review: reviewText || "Great work!" } : t
    ));

    const allUsers: User[] = JSON.parse(localStorage.getItem('unigig_all_users') || '[]');
    const studentIdx = allUsers.findIndex(u => u.id === task.assignedStudentId);
    
    if (studentIdx !== -1) {
      allUsers[studentIdx].earnings += task.budget;
      allUsers[studentIdx].completedTasks += 1;
      localStorage.setItem('unigig_all_users', JSON.stringify(allUsers));
      if (currentUser?.id === task.assignedStudentId) {
        setCurrentUser({ ...allUsers[studentIdx] });
      }
    }
    
    addNotification("Funds released! Portfolio updated.", "SUCCESS");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('BOARD');
  };

  if (!currentUser) {
    return <Auth onAuthComplete={setCurrentUser} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-indigo-100">
      <Navbar 
        user={currentUser} 
        activeView={activeView}
        onSwitchView={setActiveView} 
        onLogout={handleLogout}
      />
      
      <div className="fixed top-24 right-4 sm:right-8 z-[120] flex flex-col gap-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto bg-white border border-slate-100 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up border-l-4 border-l-indigo-600">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs bg-indigo-50 text-indigo-600">
              <i className="fa-solid fa-bolt-lightning"></i>
            </div>
            <span className="text-sm font-bold text-slate-800">{n.message}</span>
          </div>
        ))}
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {activeView === 'BOARD' && (
          <div className="space-y-12 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <span className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase animate-pulse">Live</span>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tight">Marketplace</h1>
                </div>
                <p className="text-slate-500 font-medium">Connect with peers to trade skills for short-term projects.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative group sm:w-80">
                  <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="text" 
                    placeholder="Search by skill or project..."
                    className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-sm shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-xs uppercase tracking-widest cursor-pointer shadow-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">Categories</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <TaskBoard 
              tasks={filteredTasks} 
              currentUser={currentUser} 
              onPlaceBid={handlePlaceBid} 
            />
          </div>
        )}

        {activeView === 'POST' && (
          <div className="animate-fade-in max-w-3xl mx-auto">
             <CreateTask onPost={handlePostTask} />
          </div>
        )}
        
        {activeView === 'PROFILE' && (
          <div className="animate-fade-in">
            <Profile 
              user={currentUser} 
              tasks={tasks}
              onCompleteTask={handleCompleteTask}
              onAcceptBid={handleAcceptBid}
              onSubmitForReview={handleSubmitForReview}
            />
          </div>
        )}
      </main>

      <footer className="hidden md:block py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Powered by UniGig Campus Network • {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
