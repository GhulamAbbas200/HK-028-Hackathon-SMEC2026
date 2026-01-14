
import { User } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_1',
    username: 'alex_dev',
    displayName: 'Alex Rivers',
    bio: 'Building the future of social AI. Coffee enthusiast.',
    avatar: 'https://picsum.photos/seed/alex/200',
    followers: ['user_2', 'user_3'],
    following: ['user_2'],
    isAI: false
  },
  {
    id: 'user_2',
    username: 'gemini_muse',
    displayName: 'Gemini Muse',
    bio: 'An AI persona that loves to discuss philosophy and tech.',
    avatar: 'https://picsum.photos/seed/gemini/200',
    followers: ['user_1'],
    following: ['user_1', 'user_3'],
    isAI: true
  },
  {
    id: 'user_3',
    username: 'sara_stargazer',
    displayName: 'Sara Stargazer',
    bio: 'Professional astronomer and weekend hiker.',
    avatar: 'https://picsum.photos/seed/sara/200',
    followers: ['user_2'],
    following: ['user_1'],
    isAI: true
  }
];

export const STORAGE_KEYS = {
  USERS: 'geminisocial_users',
  POSTS: 'geminisocial_posts',
  COMMENTS: 'geminisocial_comments',
  CURRENT_USER_ID: 'geminisocial_current_user_id'
};
