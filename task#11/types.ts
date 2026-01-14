
export type UserRole = 'STUDENT' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  bio: string;
  rating: number;
  completedTasks: number;
  skills: string[];
  earnings: number;
  professionalSummary?: string;
}

export interface Bid {
  id: string;
  taskId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timeframe: string;
  message: string;
  createdAt: number;
}

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'CANCELLED';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  status: TaskStatus;
  clientId: string;
  clientName: string;
  assignedStudentId?: string;
  bids: Bid[];
  createdAt: number;
  review?: string;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'ALERT';
  timestamp: number;
}
