import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Share2, LogOut, UserPlus, X, CheckCircle2, AlertTriangle, 
  ChevronRight, Settings, Users, Download, Edit2, Save, Camera, PartyPopper, QrCode, Home, ArrowRight, Clipboard,
  Loader2
} from 'lucide-react';
import { User, View, FriendPreview } from './types';
import { mockBackend } from './services/mockBackend';
import Navigation from './components/Navigation';
import QRScanner from './components/QRScanner';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('HOME');
  const [friends, setFriends] = useState<FriendPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [newFriend, setNewFriend] = useState<User | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualToken, setManualToken] = useState('');
  
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initUser = async () => {
      setLoading(true);
      const savedId = localStorage.getItem('qr_friends_user_id');
      if (savedId) {
        const user = await mockBackend.getUserById(savedId);
        if (user) {
          setCurrentUser(user);
        } else {
          const newUser = await mockBackend.autoRegister();
          setCurrentUser(newUser);
          localStorage.setItem('qr_friends_user_id', newUser.id);
        }
      } else {
        const newUser = await mockBackend.autoRegister();
        setCurrentUser(newUser);
        localStorage.setItem('qr_friends_user_id', newUser.id);
      }
      setLoading(false);
    };
    initUser();
  }, []);

  useEffect(() => {
    if (currentUser && (view === 'FRIENDS' || view === 'HOME')) {
      mockBackend.getFriends(currentUser.id).then(setFriends);
    }
  }, [currentUser, view]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLogout = () => {
    if (confirm("Resetting will delete your local identity and all connections. Proceed?")) {
      localStorage.removeItem('qr_friends_user_id');
      localStorage.removeItem('qr_friends_db');
      window.location.reload();
    }
  };

  const processConnection = async (token: string) => {
    if (!currentUser || loading) return;
    
    setLoading(true);
    try {
      const friend = await mockBackend.addFriendByToken(currentUser.id, token);
      if (friend) {
        setNewFriend(friend);
        const updatedFriends = await mockBackend.getFriends(currentUser.id);
        setFriends(updatedFriends);
        
        // Show success celebration then transition view
        setTimeout(() => {
          setNewFriend(null);
          setView('FRIENDS');
        }, 3000);
      } else {
        setNotification({ type: 'error', message: "Invalid QRFriends code" });
      }
    } catch (err: any) {
      console.error("Link error:", err);
      setNotification({ type: 'error', message: err.message || "Failed to add friend" });
    } finally {
      setLoading(false);
      setShowManualEntry(false);
      setManualToken('');
    }
  };

  const handleScan = (decodedToken: string) => {
    processConnection(decodedToken);
  };

  const handleRemoveFriend = (friendId: string) => {
    if (!currentUser) return;
    if (confirm("Remove this friend?")) {
      mockBackend.removeFriend(currentUser.id, friendId).then(() => {
        mockBackend.getFriends(currentUser.id).then(setFriends);
        setNotification({ type: 'success', message: 'Connection removed' });
      });
    }
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const svgSize = svg.getBoundingClientRect();
    canvas.width = svgSize.width * 2;
    canvas.height = svgSize.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${currentUser?.name}_QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading && !currentUser) {
    return (
      <div className="app-container items-center justify-center">
        <PartyPopper className="text-indigo-600 mb-4 animate-bounce" size={48} />
        <p className="font-bold text-slate-500">Starting QRFriends...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Processing Overlay */}
      {loading && currentUser && (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white p-10 rounded-[40px] shadow-2xl flex flex-col items-center">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="font-bold text-slate-800">Syncing Identity...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {newFriend && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" style={{ background: 'linear-gradient(to bottom, rgba(79, 70, 229, 0.98), rgba(124, 58, 237, 0.98))', backdropFilter: 'blur(30px)' }}>
          <div className="text-center animate-scale">
            <div className="relative mb-8 inline-block">
              <img src={newFriend.avatar} className="w-40 h-40 rounded-[48px] border-8 border-white shadow-2xl rotate-3" />
              <div className="absolute -bottom-4 -right-4 bg-white p-5 rounded-full shadow-2xl animate-bounce">
                <CheckCircle2 className="text-green-500" size={36} />
              </div>
            </div>
            <h2 className="text-white text-5xl font-black mb-3">Linked!</h2>
            <p className="text-indigo-100 text-xl font-bold">{newFriend.name}</p>
          </div>
        </div>
      )}

      {/* Manual Token Fallback */}
      {showManualEntry && (
        <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 animate-scale shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Manual Connect</h3>
              <button onClick={() => setShowManualEntry(false)} className="bg-slate-100 p-2 rounded-full"><X size={20} /></button>
            </div>
            <p className="text-slate-500 text-sm mb-4">Paste the identity token provided by your friend.</p>
            <textarea 
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="qrf_v1_..."
              className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-mono focus:border-indigo-500 outline-none transition-colors"
            />
            <button 
              onClick={() => processConnection(manualToken)}
              disabled={!manualToken.startsWith('qrf_')}
              className="btn btn-primary w-full mt-6 disabled:opacity-50"
            >
              Connect
            </button>
          </div>
        </div>
      )}

      {/* Global Notifications */}
      {notification && (
        <div className="fixed top-6 left-5 right-5 z-[100] animate-slide-up">
          <div className={`card flex items-center p-4 border-l-[6px] ${notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}`}>
            {notification.type === 'success' ? <CheckCircle2 className="mr-3" size={24} /> : <AlertTriangle className="mr-3" size={24} />}
            <p className="font-bold">{notification.message}</p>
          </div>
        </div>
      )}

      <main className="view-content">
        {view === 'HOME' && currentUser && (
          <div className="flex flex-col h-full">
            <header className="home-hero">
              <div className="bg-indigo-600/5 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="text-indigo-600" size={32} />
              </div>
              <h1>QRFriends</h1>
              <p className="text-slate-500 font-bold text-sm tracking-wide uppercase mt-1">Instant Connection</p>
            </header>

            <div className="space-y-4">
              <button onClick={() => setView('SCAN')} className="option-card scan-qr group">
                <div className="icon-blob group-hover:scale-110 transition-transform"><Camera size={32} /></div>
                <h3 className="text-xl font-extrabold">Scan QR</h3>
                <p className="text-blue-100 text-sm mt-1">Connect with a friend</p>
              </button>

              <button onClick={() => setView('QR')} className="option-card show-qr group">
                <div className="icon-blob group-hover:scale-110 transition-transform"><QrCode size={32} /></div>
                <h3 className="text-xl font-extrabold">My Code</h3>
                <p className="text-slate-400 text-sm mt-1">Share your identity</p>
              </button>
            </div>

            <div className="mt-8">
               <button 
                onClick={() => setShowManualEntry(true)}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold text-sm hover:border-indigo-300 hover:text-indigo-500 transition-colors"
               >
                 <Clipboard size={18} /> Use Identity Token
               </button>
            </div>

            <div className="mt-auto pt-8">
              <div onClick={() => setView('FRIENDS')} className="card flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 active:scale-95">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-3 rounded-2xl"><Users className="text-indigo-600" size={24} /></div>
                  <div>
                    <p className="font-black text-slate-900">{friends.length} Connections</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Linked</p>
                  </div>
                </div>
                <ArrowRight className="text-slate-300" size={20} />
              </div>
            </div>
          </div>
        )}

        {view === 'QR' && currentUser && (
          <div className="animate-scale flex flex-col items-center">
            <header className="w-full flex justify-between items-center mb-10">
              <button onClick={() => setView('HOME')} className="btn btn-secondary p-3 rounded-full"><X size={24} /></button>
              <h2 className="text-2xl font-black">My Identity</h2>
              <button onClick={downloadQR} className="btn btn-secondary p-3 rounded-full"><Download size={24} /></button>
            </header>

            <div className="identity-card w-full max-w-[340px]">
              <div className="qr-frame shadow-inner" ref={qrRef}>
                <QRCodeSVG value={currentUser.qrToken} size={220} level="M" bgColor="transparent" fgColor="#0F172A" includeMargin={false} />
              </div>
              <div className="flex flex-col items-center">
                <img src={currentUser.avatar} className="w-24 h-24 rounded-3xl border-8 border-white shadow-2xl -mt-16 bg-white mb-4" />
                <h3 className="text-2xl font-black">{currentUser.name}</h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">QRFriends Payload v1.0</p>
              </div>
            </div>

            <p className="text-center text-slate-400 font-medium mt-10 max-w-[260px] leading-relaxed">Let a friend scan this code to link with you instantly.</p>
          </div>
        )}

        {view === 'SCAN' && (
          <div className="h-full flex flex-col">
            <header className="flex items-center justify-between mb-8">
              <button onClick={() => setView('HOME')} className="btn btn-secondary p-3 rounded-full"><X size={24} /></button>
              <h2 className="text-2xl font-black">Scanner</h2>
              <div className="w-12"></div>
            </header>
            {/* 
              FIX: Removed overflow-hidden and rounded corners from this wrapper. 
              Some browsers (Safari iOS especially) struggle with video feeds inside CSS-clipped containers.
            */}
            <div className="flex-1 relative bg-black shadow-2xl">
              <QRScanner onScan={handleScan} onError={(msg) => setNotification({ type: 'error', message: msg })} />
            </div>
          </div>
        )}

        {view === 'FRIENDS' && (
          <div className="animate-fade-in flex flex-col h-full">
            <header className="mb-10">
              <h2 className="text-4xl font-black">Circle</h2>
              <p className="text-slate-500 font-medium">{friends.length} Active Connections</p>
            </header>

            {friends.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-100/50 p-10 rounded-[48px] mb-8 text-slate-200">
                  <Users size={80} />
                </div>
                <p className="text-2xl font-black text-slate-800">No one yet</p>
                <p className="text-slate-400 mt-2 max-w-[240px] leading-relaxed">Your connections will appear here after a successful scan.</p>
                <button onClick={() => setView('SCAN')} className="btn btn-primary mt-10 rounded-3xl">Open Scanner</button>
              </div>
            ) : (
              <div className="space-y-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="card p-4 flex items-center justify-between hover:border-indigo-200 transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <img src={friend.avatar} className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border-2 border-slate-50" />
                      <div>
                        <h4 className="font-black text-slate-900">{friend.name}</h4>
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active Link</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveFriend(friend.id); }} 
                      className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'PROFILE' && currentUser && (
          <div className="animate-fade-in pb-10">
            <header className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-black">Profile</h2>
              <button onClick={handleLogout} className="text-red-500 font-bold bg-red-50 px-5 py-3 rounded-2xl flex items-center gap-2 active:scale-90 transition-transform">
                <LogOut size={18} /> Reset App
              </button>
            </header>

            <div className="card text-center relative overflow-hidden p-8">
              <div style={{ height: 120, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', position: 'absolute', top: 0, left: 0, right: 0 }}></div>
              <img src={currentUser.avatar} className="w-32 h-32 rounded-[40px] border-8 border-white shadow-2xl relative mt-8 mx-auto mb-6 bg-white" />
              <h3 className="text-3xl font-black text-slate-900">{currentUser.name}</h3>
              <p className="text-slate-400 font-black tracking-[0.2em] text-[10px] uppercase mb-8">Personal Token User</p>
              
              <div className="text-left bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4">
                <div className="bg-white p-2 rounded-xl shadow-sm"><QrCode size={18} className="text-indigo-500" /></div>
                <div className="flex-1 overflow-hidden">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-2">My Friend Token</p>
                   <code className="text-[10px] font-mono text-slate-500 break-all leading-relaxed">{currentUser.qrToken}</code>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(currentUser.qrToken);
                  setNotification({ type: 'success', message: 'Token copied' });
                }}
                className="card w-full p-6 flex items-center justify-between hover:bg-slate-50 group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl group-hover:bg-blue-100 transition-colors"><Share2 size={22} className="text-blue-600" /></div>
                  <span className="font-bold text-slate-700">Copy Identity Link</span>
                </div>
                <ChevronRight size={20} className="text-slate-300" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Navigation currentView={view} setView={setView} />
    </div>
  );
};

export default App;