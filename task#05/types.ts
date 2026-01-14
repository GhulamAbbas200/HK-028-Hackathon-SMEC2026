
export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  qrToken: string;
  friends: string[]; // List of user IDs
  createdAt: number;
}

export interface FriendPreview {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export type View = 'HOME' | 'QR' | 'SCAN' | 'FRIENDS' | 'PROFILE';

export interface AppState {
  currentUser: User | null;
  currentView: View;
}
