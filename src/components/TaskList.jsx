// src/components/TaskList.jsx
import React from 'react';
import { List, Typography, Box } from '@mui/material';
import Task from './Task';

const TaskList = ({ tasks, onDelete, onEdit, onToggleComplete }) => {
  if (tasks.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 4, 
          bgcolor: '#f8f9fa', 
          borderRadius: 2 
        }}
      >
        <Typography variant="subtitle1" color="textSecondary">
          No tasks to display. Add a new task to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1 }}>
      {tasks.map(task => (
        <Task
          key={task.id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </List>
  );
};

export default TaskList;