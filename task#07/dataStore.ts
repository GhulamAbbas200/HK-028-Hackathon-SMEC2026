
import { STORAGE_KEYS, INITIAL_USERS } from './constants';
import { User, Post, Comment } from './types';

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : INITIAL_USERS;
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getStoredPosts = (): Post[] => {
  const data = localStorage.getItem(STORAGE_KEYS.POSTS);
  return data ? JSON.parse(data) : [];
};

export const savePosts = (posts: Post[]) => {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
};

export const getStoredComments = (): Comment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
  return data ? JSON.parse(data) : [];
};

export const saveComments = (comments: Comment[]) => {
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
};

// Use sessionStorage for the ID so different tabs can be different users
export const getCurrentUserId = (): string | null => {
  return sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
};

export const setCurrentUserId = (id: string) => {
  sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
};
