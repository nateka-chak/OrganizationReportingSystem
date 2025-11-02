import React, { useState, useEffect } from 'react';
import { Task } from './types';
import { getTasks, createTask, updateTask, deleteTask, getWeeks } from './api';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import WeekSelector from './components/WeekSelector';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeks, setWeeks] = useState<string[]>([]);
  const [currentWeek, setCurrentWeek] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getWeekNumber = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-${weekNumber.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const week = getWeekNumber();
    setCurrentWeek(week);
    loadWeeks();
  }, []);

  useEffect(() => {
    if (currentWeek) {
      loadTasks(currentWeek);
    }
  }, [currentWeek]);

  const loadTasks = async (week: string) => {
    setLoading(true);
    try {
      const tasksData = await getTasks(week);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeks = async () => {
    try {
      const weeksData = await getWeeks();
      setWeeks(weeksData);
    } catch (error) {
      console.error('Error loading weeks:', error);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, '_id'>) => {
    try {
      const newTask = await createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      if (!weeks.includes(taskData.week)) {
        setWeeks(prev => [...prev, taskData.week].sort().reverse());
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(id, updates);
      setTasks(prev => prev.map(task => task._id === id ? updatedTask : task));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(task => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const nextWeekTasks = tasks.filter(task => task.status === 'next-week');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Weekly Task Reports
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <WeekSelector
              weeks={weeks}
              currentWeek={currentWeek}
              onWeekChange={setCurrentWeek}
            />
            
            <TaskForm
              currentWeek={currentWeek}
              onSubmit={handleCreateTask}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <>
                <TaskList
                  title="Completed This Week"
                  tasks={completedTasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  emptyMessage="No tasks completed this week."
                  className="bg-green-50 border-green-200"
                />
                
                <TaskList
                  title="Pending Tasks"
                  tasks={pendingTasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  emptyMessage="No pending tasks."
                  className="bg-yellow-50 border-yellow-200"
                />
                
                <TaskList
                  title="Next Week"
                  tasks={nextWeekTasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  emptyMessage="No tasks planned for next week."
                  className="bg-blue-50 border-blue-200"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;