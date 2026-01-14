
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Post, Comment, View } from './types.ts';
import { 
  getStoredUsers, saveUsers, 
  getStoredPosts, savePosts, 
  getStoredComments, saveComments,
  getCurrentUserId, setCurrentUserId 
} from './dataStore.ts';
import { generateAIResponse, generateGlobalPost } from './services/geminiService.ts';
import { STORAGE_KEYS } from './constants.ts';

// --- Sub-components ---

const UserAvatar: React.FC<{ user?: User; size?: number }> = ({ user, size = 48 }) => (
  <img 
    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=fallback`} 
    alt={user?.displayName} 
    className="avatar" 
    style={{ width: size, height: size, borderRadius: size / 2.8 }}
  />
);

const PostCard: React.FC<{ 
  post: Post; 
  author: User; 
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  currentUserId: string;
  comments: Comment[];
  getUser: (id: string) => User | undefined;
  onDelete: (postId: string) => void;
}> = ({ post, author, onLike, onComment, currentUserId, comments, getUser, onDelete }) => {
  const [commentText, setCommentText] = useState('');
  const isLiked = post.likes.includes(currentUserId);
  const isAuthor = author.id === currentUserId;

  return (
    <div className={`card ${post.isLive ? 'live-post' : ''}`} style={post.isLive ? { borderLeft: '6px solid var(--primary)' } : {}}>
      <div className="post-header">
        <div className="author-info">
          <UserAvatar user={author} />
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>{author.displayName}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>@{author.username} {author.isAI && '• Global Anchor'}</p>
          </div>
        </div>
        {isAuthor && (
          <button onClick={() => onDelete(post.id)} style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>Delete</button>
        )}
      </div>

      <div className="post-body" style={{ margin: '16px 0', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
        {post.content}
        {post.sources && post.sources.length > 0 && (
          <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Global Context Sources:</p>
            {post.sources.map((s, i) => s.web && (
              <a key={i} href={s.web.uri} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                • {s.web.title}
              </a>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', padding: '12px 0', borderTop: '1px solid #f8fafc' }}>
        <button onClick={() => onLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isLiked ? '#f43f5e' : 'var(--text-muted)', fontWeight: 700 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          {post.likes.length}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 700 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
          {comments.length}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        {comments.map(c => {
          const cAuthor = getUser(c.authorId);
          return (
            <div key={c.id} style={{ display: 'flex', gap: '10px', padding: '12px', background: '#f8fafc', borderRadius: '16px' }}>
              <UserAvatar user={cAuthor} size={32} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 800 }}>{cAuthor?.displayName || 'Unknown'}</p>
                <p style={{ fontSize: '0.9rem', color: '#334155' }}>{c.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form 
        style={{ marginTop: '16px', display: 'flex', gap: '10px' }}
        onSubmit={(e) => { e.preventDefault(); if(commentText.trim()) { onComment(post.id, commentText); setCommentText(''); } }}
      >
        <input 
          placeholder="Write a comment..." 
          style={{ height: '48px', borderRadius: '999px', fontSize: '0.9rem', padding: '0 24px' }}
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
        />
      </form>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [view, setView] = useState<View>('ONBOARDING');
  const [toast, setToast] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [profileForm, setProfileForm] = useState({ 
    displayName: '', 
    username: '', 
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}` 
  });

  // Sync state from Local Storage
  const syncFromStorage = useCallback(() => {
    setUsers(getStoredUsers());
    setPosts(getStoredPosts());
    setComments(getStoredComments());
    const storedId = getCurrentUserId();
    if (storedId) {
      setCurrentUserIdState(storedId);
      if (view === 'ONBOARDING') setView('FEED');
    }
  }, [view]);

  // Handle Multi-User / Multi-Tab Synchronization
  useEffect(() => {
    syncFromStorage();
    const handleStorage = (e: StorageEvent) => {
      if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
        setIsSyncing(true);
        syncFromStorage();
        setTimeout(() => setIsSyncing(false), 1000);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [syncFromStorage]);

  // "World Anchor" - AI user periodically posts real news to make the app feel alive
  useEffect(() => {
    const worldBridge = setInterval(async () => {
      const ai = users.find(u => u.isAI);
      if (ai && Math.random() > 0.8) {
        const globalUpdate = await generateGlobalPost(ai);
        if (globalUpdate) {
          const newPost: Post = {
            id: `p_global_${Date.now()}`,
            authorId: ai.id,
            content: globalUpdate.text,
            timestamp: Date.now(),
            likes: [],
            isLive: true,
            sources: globalUpdate.sources
          };
          const updated = [newPost, ...getStoredPosts()];
          setPosts(updated);
          savePosts(updated);
          setIsSyncing(true);
          setTimeout(() => setIsSyncing(false), 1000);
        }
      }
    }, 45000);
    return () => clearInterval(worldBridge);
  }, [users]);

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);
  const getUser = useCallback((id: string) => users.find(u => u.id === id), [users]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleJoin = () => {
    if (!profileForm.displayName || !profileForm.username) return;
    const newUser: User = {
      id: `u_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      username: profileForm.username.toLowerCase().replace(/\s/g, ''),
      displayName: profileForm.displayName,
      bio: '',
      avatar: profileForm.avatar,
      followers: [],
      following: [],
      isAI: false
    };
    const updatedUsers = [...getStoredUsers(), newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    setCurrentUserIdState(newUser.id);
    setCurrentUserId(newUser.id);
    setView('FEED');
    showToast(`Welcome to the Square, ${newUser.displayName}!`);
  };

  const handleCreatePost = () => {
    if (!currentUserId || !newPostContent.trim()) return;
    const newPost: Post = {
      id: `p_${Date.now()}_${currentUserId}`,
      authorId: currentUserId,
      content: newPostContent.trim(),
      timestamp: Date.now(),
      likes: []
    };
    const updated = [newPost, ...posts];
    setPosts(updated);
    savePosts(updated);
    setNewPostContent('');
    showToast("Shared with the world");
  };

  const handleLike = (pid: string) => {
    const updated = posts.map(p => p.id === pid ? {
      ...p,
      likes: p.likes.includes(currentUserId!) ? p.likes.filter(id => id !== currentUserId) : [...p.likes, currentUserId!]
    } : p);
    setPosts(updated);
    savePosts(updated);
  };

  const handleComment = (pid: string, text: string) => {
    const newC: Comment = {
      id: `c_${Date.now()}_${currentUserId}`,
      postId: pid,
      authorId: currentUserId!,
      content: text,
      timestamp: Date.now()
    };
    const updated = [...comments, newC];
    setComments(updated);
    saveComments(updated);

    // AI Reaction
    setTimeout(async () => {
      const ai = users.find(u => u.isAI);
      const post = posts.find(p => p.id === pid);
      if (ai && post && Math.random() > 0.5) {
        const reply = await generateAIResponse(ai, post, getUser(post.authorId)!, updated);
        if (reply) {
          const aiComment: Comment = { id: `c_ai_${Date.now()}`, postId: pid, authorId: ai.id, content: reply, timestamp: Date.now() };
          const finalComments = [...getStoredComments(), aiComment];
          setComments(finalComments);
          saveComments(finalComments);
          setIsSyncing(true);
          setTimeout(() => setIsSyncing(false), 1000);
        }
      }
    }, 2500);
  };

  if (view === 'ONBOARDING') {
    return (
      <div className="onboarding-overlay">
        <div className="onboarding-card">
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '32px' }}>
            <div className="logo-icon"></div>
            poso
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Join the Square</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Create an identity to post on the Global Square.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-item">
              <label className="form-label">Full Name</label>
              <input 
                placeholder="e.g. Ali Khan" 
                value={profileForm.displayName} 
                onChange={e => setProfileForm({...profileForm, displayName: e.target.value})}
              />
            </div>
            <div className="form-item">
              <label className="form-label">Username</label>
              <input 
                placeholder="e.g. ali_99" 
                value={profileForm.username} 
                onChange={e => setProfileForm({...profileForm, username: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
              <img src={profileForm.avatar} style={{ width: 64, height: 64, borderRadius: 20, background: '#f1f5f9' }} alt="Preview" />
              <button 
                className="refresh-btn" 
                onClick={() => setProfileForm({...profileForm, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`})}
              >
                Randomize Avatar
              </button>
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '40px', padding: '18px' }}
            onClick={handleJoin}
            disabled={!profileForm.displayName || !profileForm.username}
          >
            Start Participating
          </button>

          <div style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Resume Identity:</p>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', justifyContent: 'center' }}>
              {users.filter(u => !u.isAI).map(u => (
                <button key={u.id} onClick={() => { setCurrentUserIdState(u.id); setCurrentUserId(u.id); setView('FEED'); }}>
                  <UserAvatar user={u} size={44} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      <nav className="nav">
        <div className="nav-content">
          <div className="logo" onClick={() => setView('FEED')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon"></div>
            poso
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="sync-indicator">
              <div className={`sync-dot ${isSyncing ? 'active' : ''}`}></div>
              {isSyncing ? 'Syncing...' : 'Live'}
            </div>
            <div className="user-pill" onClick={() => setView('PROFILE')}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentUser?.displayName}</span>
              <UserAvatar user={currentUser!} size={32} />
            </div>
          </div>
        </div>
      </nav>

      <div className="container">
        {view === 'FEED' ? (
          <>
            <div className="editor-card">
              <textarea 
                placeholder="What's happening in your world?" 
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <button 
                  className="btn-primary" 
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                >
                  Share Post
                </button>
              </div>
            </div>

            <div className="feed">
              {posts.map(p => {
                const author = getUser(p.authorId);
                if (!author) return null;
                return (
                  <PostCard 
                    key={p.id} post={p} author={author} 
                    currentUserId={currentUserId!} getUser={getUser}
                    comments={comments.filter(c => c.postId === p.id)}
                    onLike={handleLike} onComment={handleComment}
                    onDelete={id => { setPosts(prev => prev.filter(x => x.id !== id)); savePosts(getStoredPosts().filter(x => x.id !== id)); }}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <UserAvatar user={currentUser!} size={120} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '20px' }}>{currentUser?.displayName}</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>@{currentUser?.username}</p>
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', margin: '32px 0' }}>
              <div><b style={{ fontSize: '1.2rem' }}>{currentUser?.following.length}</b> Following</div>
              <div><b style={{ fontSize: '1.2rem' }}>{currentUser?.followers.length}</b> Followers</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '40px' }}>
              <button className="btn-primary" onClick={() => setView('FEED')}>Back to Feed</button>
              <button className="btn-primary" style={{ background: '#f1f5f9', color: 'var(--text-main)', boxShadow: 'none' }} onClick={() => { setCurrentUserId(""); sessionStorage.clear(); window.location.reload(); }}>Log Out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
