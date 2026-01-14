
export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  followers: string[]; 
  following: string[]; 
  isAI: boolean;
  isCustom?: boolean; // Track if user was created by the current session
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  timestamp: number;
  likes: string[];
  isLive?: boolean; // Flag for real-time synced posts
  sources?: any[]; // Store grounding chunks for search-enabled posts
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  timestamp: number;
}

export type View = 'FEED' | 'PROFILE' | 'SEARCH' | 'ONBOARDING' | 'EDIT_PROFILE';
