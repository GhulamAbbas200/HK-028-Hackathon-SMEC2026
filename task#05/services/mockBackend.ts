import { User, FriendPreview } from '../types';

const STORAGE_KEY = 'qr_friends_db';

interface DB {
  users: Record<string, User>;
}

const getDB = (): DB => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return { users: {} };
  return JSON.parse(data);
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

// Helper to encode profile into a QR-friendly string
const encodeProfile = (user: User): string => {
  const payload = {
    i: user.id,
    n: user.name,
    a: user.avatar,
    b: user.bio,
    v: '1.0' // versioning for future-proofing
  };
  return `qrf_v1_${btoa(JSON.stringify(payload))}`;
};

// Helper to decode profile from a QR string
const decodeProfile = (token: string): any => {
  try {
    if (!token.startsWith('qrf_v1_')) return null;
    const base64 = token.replace('qrf_v1_', '');
    return JSON.parse(atob(base64));
  } catch (e) {
    return null;
  }
};

export const mockBackend = {
  autoRegister: async (): Promise<User> => {
    const db = getDB();
    const id = Math.random().toString(36).substr(2, 9);
    const names = ["Alex", "Jordan", "Taylor", "Casey", "Morgan", "Riley", "Quinn"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    const newUser: User = {
      id,
      name: `${randomName} ${id.toUpperCase()}`,
      email: `${id}@qrfriends.local`,
      bio: "Available for connection",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
      qrToken: '', // Set below
      friends: [],
      createdAt: Date.now()
    };
    
    // Encode the identity into the token itself
    newUser.qrToken = encodeProfile(newUser);
    
    db.users[id] = newUser;
    saveDB(db);
    return newUser;
  },

  getUserById: async (id: string): Promise<User | null> => {
    const db = getDB();
    return db.users[id] || null;
  },

  updateProfile: async (id: string, updates: Partial<User>): Promise<User> => {
    const db = getDB();
    if (!db.users[id]) throw new Error("User not found");
    db.users[id] = { ...db.users[id], ...updates };
    // Re-generate token if name or avatar changes
    db.users[id].qrToken = encodeProfile(db.users[id]);
    saveDB(db);
    return db.users[id];
  },

  getFriends: async (userId: string): Promise<FriendPreview[]> => {
    const db = getDB();
    const user = db.users[userId];
    if (!user) return [];
    return user.friends
      .map(fid => db.users[fid])
      .filter(Boolean)
      .map(f => ({
        id: f.id,
        name: f.name,
        avatar: f.avatar,
        bio: f.bio
      }));
  },

  addFriendByToken: async (currentUserId: string, token: string): Promise<User | null> => {
    const payload = decodeProfile(token);
    if (!payload) {
      // Fallback for old tokens if any
      if (token.startsWith('qrf_token_')) {
        const friendId = token.replace('qrf_token_', '');
        const db = getDB();
        return db.users[friendId] || null;
      }
      return null;
    }

    const friendId = payload.i;
    if (friendId === currentUserId) throw new Error("You can't add yourself!");

    const db = getDB();
    const currentUser = db.users[currentUserId];
    if (!currentUser) throw new Error("Current user not found");

    // "Discover" the user: If they don't exist in our local storage (different device), 
    // add their profile now so we can link to it.
    if (!db.users[friendId]) {
      db.users[friendId] = {
        id: payload.i,
        name: payload.n,
        email: `${payload.i}@remote.qrf`,
        bio: payload.b,
        avatar: payload.a,
        qrToken: token,
        friends: [currentUserId], // In a real app, this is handled server-side
        createdAt: Date.now()
      };
    }

    const targetUser = db.users[friendId];

    // Prevent duplicates
    if (currentUser.friends.includes(friendId)) {
      throw new Error("Already friends!");
    }

    // Connect
    currentUser.friends.push(friendId);
    
    // In this mock environment, we also ensure the target knows the scanner
    if (!targetUser.friends.includes(currentUserId)) {
      targetUser.friends.push(currentUserId);
    }

    saveDB(db);
    return targetUser;
  },

  removeFriend: async (currentUserId: string, friendId: string): Promise<void> => {
    const db = getDB();
    const currentUser = db.users[currentUserId];
    const targetUser = db.users[friendId];

    if (currentUser) {
      currentUser.friends = currentUser.friends.filter(id => id !== friendId);
    }
    if (targetUser) {
      targetUser.friends = targetUser.friends.filter(id => id !== currentUserId);
    }
    saveDB(db);
  }
};