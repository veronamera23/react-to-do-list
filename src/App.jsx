// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, Snackbar, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import * as api from './services/api';

// Import your components
import AddTaskForm from './components/AddTaskForm';
import TaskList from './components/TaskList';
import EditTaskForm from './components/EditTaskForm';
import ConfirmDialog from './components/ConfirmDialog';
import SortingOptions from './components/SortingOptions';

const theme = createTheme({
  palette: {
    primary: {
      main: '#f8bbd0', // pastel pink
      contrastText: '#fff',
    },
    secondary: {
      main: '#ffe0b2', // pastel beige
      contrastText: '#a1887f',
    },
    background: {
      default: '#fff8f6', // very light pink/beige
      paper: '#fff0f6',   // slightly pinker for cards
    },
  },
  typography: {
    fontFamily: '"Quicksand", "Comic Sans MS", cursive, sans-serif',
    h4: {
      fontWeight: 700,
      color: '#d48fa6',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: '#fff0f6',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          background: '#f8bbd0',
          color: '#a1887f',
        },
      },
    },
  },
});

// Replace react-toastify with MUI's Snackbar
function App() {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [editTask, setEditTask] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [lastDeletedTask, setLastDeletedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Snackbar related states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showUndoButton, setShowUndoButton] = useState(false);

  // Show notification function
  const showNotification = (message, severity = 'success', withUndo = false) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowUndoButton(withUndo);
    setSnackbarOpen(true);
  };

  // Handle close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await api.getTasks();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        showNotification('Failed to load tasks. Please try again later.', 'error');
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
      showNotification('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      showNotification('Failed to add task. Please try again.', 'error');
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
      showNotification('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      showNotification('Failed to update task. Please try again.', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    const task = tasks.find(task => task.id === id);
    setTaskToDelete(task);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const taskId = taskToDelete.id;
      const taskCopy = {...taskToDelete}; // Make a copy of the task before deleting
      
      // Store the original task data before deletion
      setLastDeletedTask(taskCopy);
      
      // Remove task from the list first (optimistic UI update)
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      setIsConfirmDialogOpen(false);
      
      // Then delete from backend
      await api.deleteTask(taskId);
      
      // Show deletion notification with UNDO option
      showNotification('Task deleted!', 'info', true);
    } catch (error) {
      console.error('Error deleting task:', error);
      showNotification('Failed to delete task. Please try again.', 'error');
    }
  };

  const handleUndoDelete = async () => {
    if (!lastDeletedTask) {
      console.log("No task to restore");
      return;
    }

    try {
      // When restoring a task, we want to preserve as much of the original data as possible
      const { id: oldId, ...taskData } = lastDeletedTask;
      
      console.log("Restoring task:", taskData);
      
      // Create a new task with the original data
      const restoredTask = await api.createTask({
        ...taskData,
        createdAt: new Date().toISOString() // Update creation date to now
      });
      
      console.log("Restored task:", restoredTask);
      
      // Add the restored task back to the list at the top
      setTasks(prevTasks => [restoredTask, ...prevTasks]);
      
      // Reset deleted task reference and close the snackbar
      setLastDeletedTask(null);
      setSnackbarOpen(false);
      
      // Show a confirmation that the task was restored
      setTimeout(() => {
        showNotification('Task restored successfully!', 'success');
      }, 300); // Small delay for better UX
    } catch (error) {
      console.error('Error restoring task:', error);
      showNotification('Failed to restore task. Please try again.', 'error');
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
      showNotification('Failed to update task status. Please try again.', 'error');
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
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        {/* Task deleted snackbar with UNDO button */}
        <Snackbar 
          open={snackbarOpen && showUndoButton} 
          autoHideDuration={8000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          message="Task deleted"
          action={
            <>
              <Button 
                color="secondary" 
                size="small" 
                onClick={handleUndoDelete}
                sx={{ 
                  color: '#fff', 
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                UNDO
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={handleCloseSnackbar}
                sx={{
                  color: '#fff',
                  fontSize: '2rem',        // Increase the size of the "×"
                  minWidth: '40px',        // Make the button area bigger for easier clicking
                  padding: 0,
                  lineHeight: 1,
                  fontWeight: 'bold'
                }}
              >
                ×
              </Button>
            </>
          }
          sx={{
            '& .MuiSnackbarContent-root': {
              backgroundColor: '#323232',
              minWidth: '250px'
            }
          }}
        />
        
        {/* Regular notification snackbar (no UNDO) */}
        <Snackbar 
          open={snackbarOpen && !showUndoButton} 
          autoHideDuration={4000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        
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
    </ThemeProvider>
  );
}

export default App;