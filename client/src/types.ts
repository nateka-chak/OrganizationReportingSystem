export interface Task {
  _id?: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'next-week';
  week: string;
  createdAt?: string;
  updatedAt?: string;
}