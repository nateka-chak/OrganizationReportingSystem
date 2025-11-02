import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  title: string;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  emptyMessage: string;
  className?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  title,
  tasks,
  onUpdateTask,
  onDeleteTask,
  emptyMessage,
  className = 'bg-white'
}) => {
  return (
    <div className={`p-6 rounded-lg shadow-md border ${className}`}>
      <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-sm font-normal text-gray-600">
          ({tasks.length})
        </span>
      </h2>
      
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskItem
              key={task._id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;