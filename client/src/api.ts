import axios from 'axios';
import { Task } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getTasks = async (week: string): Promise<Task[]> => {
  const response = await api.get(`/tasks/${week}`);
  return response.data;
};

export const createTask = async (task: Omit<Task, '_id'>): Promise<Task> => {
  const response = await api.post('/tasks', task);
  return response.data;
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const getWeeks = async (): Promise<string[]> => {
  const response = await api.get('/weeks');
  return response.data;
};