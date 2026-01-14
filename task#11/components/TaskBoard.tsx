
import React, { useState } from 'react';
import { Task, User } from '../types';
import TaskCard from './TaskCard';
import BidModal from './BidModal';

interface TaskBoardProps {
  tasks: Task[];
  currentUser: User | null;
  onPlaceBid: (taskId: string, bidData: any) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, currentUser, onPlaceBid }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
          <i className="fa-solid fa-ghost text-4xl"></i>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">The board is clear</h3>
        <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm leading-relaxed">
          No tasks match your current filters. Be the first to post a new gig or try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            currentUser={currentUser}
            onBid={() => setSelectedTask(task)} 
          />
        ))}
      </div>

      {selectedTask && (
        <BidModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          onSubmit={(data) => {
            onPlaceBid(selectedTask.id, data);
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
};

export default TaskBoard;
