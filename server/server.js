const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Task = require('./models/Task'); // Import the Task model

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weekly-reports';

// Validate MongoDB URI format
if (MONGODB_URI && !MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  console.warn('Invalid MONGODB_URI format, using default localhost connection');
  MONGODB_URI = 'mongodb://localhost:27017/weekly-reports';
}

// Remove deprecated options (they're default in newer mongoose versions)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    console.log('Attempting to connect to default localhost MongoDB...');
    // Try default connection if the first one fails
    if (MONGODB_URI !== 'mongodb://localhost:27017/weekly-reports') {
      mongoose.connect('mongodb://localhost:27017/weekly-reports')
        .then(() => {
          console.log('Connected to default MongoDB');
        })
        .catch((err) => {
          console.error('Failed to connect to MongoDB:', err.message);
          console.error('Please ensure MongoDB is running or set MONGODB_URI environment variable');
        });
    }
  });

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error.message);
});
db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
app.get('/api/tasks/:week', async (req, res) => {
  try {
    const tasks = await Task.find({ week: req.params.week }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/weeks', async (req, res) => {
  try {
    const weeks = await Task.distinct('week');
    res.json(weeks.sort().reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});