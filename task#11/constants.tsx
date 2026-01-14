
import { User, Task } from './types';

export const CATEGORIES = [
  'Academic Tutoring',
  'Graphic Design',
  'Software Development',
  'Writing & Translation',
  'Video & Audio',
  'Research',
  'Other'
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Johnson',
    email: 'alex@uni.edu',
    role: 'STUDENT',
    avatar: 'https://picsum.photos/seed/alex/100/100',
    bio: 'CS Major, passionate about React and UI design.',
    rating: 4.8,
    completedTasks: 12,
    skills: ['React', 'TypeScript', 'Tailwind', 'Figma'],
    // Added missing required earnings property
    earnings: 450
  },
  {
    id: 'u2',
    name: 'Prof. Miller',
    email: 'miller@uni.edu',
    role: 'CLIENT',
    avatar: 'https://picsum.photos/seed/miller/100/100',
    bio: 'Department head looking for research assistants.',
    rating: 5.0,
    completedTasks: 5,
    skills: [],
    // Added missing required earnings property
    earnings: 0
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Design a Department Logo',
    description: 'We need a modern logo for the Biology department. Vector format preferred.',
    category: 'Graphic Design',
    budget: 50,
    deadline: '2023-12-30',
    status: 'OPEN',
    clientId: 'u2',
    clientName: 'Prof. Miller',
    bids: [],
    createdAt: Date.now() - 86400000
  },
  {
    id: 't2',
    title: 'Python Script for Data Analysis',
    description: 'Analyze a CSV file with 10k rows and generate a PDF summary report.',
    category: 'Software Development',
    budget: 120,
    deadline: '2023-12-25',
    status: 'OPEN',
    clientId: 'u2',
    clientName: 'Prof. Miller',
    bids: [],
    createdAt: Date.now() - 43200000
  }
];
