// src/App.jsx
// Update your App.jsx with some modifications for Firebase
// Only showing the parts that need to change

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AddTaskForm from './components/AddTaskForm';
import TaskList from './components/TaskList';
import EditTaskForm from './components/EditTaskForm';
import ConfirmDialog from './components/ConfirmDialog';
import SortingOptions from './components/SortingOptions';
import * as api from './services/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [editTask, setEditTask] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [lastDeletedTask, setLastDeletedTask] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await api.getTasks();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleAddTask = async (newTask) => {
    try {
      const addedTask = await api.createTask(newTask);
      setTasks(prevTasks => [addedTask, ...prevTasks]);
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task. Please try again.');
    }
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (updatedTask) => {
    try {
      // Make sure updatedTask.id is the Firestore string ID
      const savedTask = await api.updateTask(updatedTask.id, updatedTask);
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === savedTask.id ? savedTask : task)
      );
      setIsEditDialogOpen(false);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task. Please try again.');
    }
  };

  const handleDeleteClick = (id) => {
    const task = tasks.find(task => task.id === id);
    setTaskToDelete(task);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.deleteTask(taskToDelete.id); // Use Firestore string ID
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
      setIsConfirmDialogOpen(false);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  const handleUndoDelete = async () => {
    if (!lastDeletedTask) return;
    
    try {
      // For Firebase, we need to create a new task rather than restore the old one
      const restoredTask = await api.createTask({
        ...lastDeletedTask,
        createdAt: new Date().toISOString()
      });
      setTasks(prevTasks => [restoredTask, ...prevTasks]);
      setLastDeletedTask(null);
      toast.success('Task restored!');
    } catch (error) {
      console.error('Error restoring task:', error);
      toast.error('Failed to restore task. Please try again.');
    }
  };

  const handleToggleComplete = async (id) => {
    const task = tasks.find(task => task.id === id);
    const updatedTask = { ...task, completed: !task.completed };
    
    try {
      const savedTask = await api.updateTask(id, updatedTask);
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === id ? savedTask : task)
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status. Please try again.');
    }
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const getSortedTasks = () => {
    switch (sortBy) {
      case 'dateAdded':
        return [...tasks].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      case 'dueDate':
        return [...tasks].sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return [...tasks].sort((a, b) => 
          priorityOrder[a.priority] - priorityOrder[b.priority]
        );
      default:
        return tasks;
    }
  };

  return (
    <Container maxWidth="md">
      <ToastContainer position="bottom-right" />
      
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          React To-Do List App
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <AddTaskForm onAddTask={handleAddTask} />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <SortingOptions sortBy={sortBy} onSortChange={handleSortChange} />
          </Box>
          
          <TaskList
            tasks={getSortedTasks()}
            onDelete={handleDeleteClick}
            onEdit={handleEditTask}
            onToggleComplete={handleToggleComplete}
          />
        </Paper>
      </Box>
      
      <EditTaskForm
        open={isEditDialogOpen}
        task={editTask}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdit}
      />
      
      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </Container>
  );
}

export default App;
