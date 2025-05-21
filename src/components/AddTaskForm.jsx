// src/components/AddTaskForm.jsx
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid
} from '@mui/material';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const AddTaskForm = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const newTask = {
      title,
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onAddTask(newTask);
    setTitle('');
    setDueDate(null);
    setPriority('medium');
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        mb: 4, 
        p: 3, 
        bgcolor: '#fff0f6', // pastel pink background
        borderRadius: 3, 
        boxShadow: '0 2px 12px 0 #ffe0eb',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label="New Task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <div style={{ marginTop: '16px', marginBottom: '8px' }}>
            <DatePicker
              selected={dueDate}
              onChange={date => setDueDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Due Date & Time"
              customInput={<TextField fullWidth />}
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              label="Priority"
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            sx={{ mt: 1, height: '56px' }}
          >
            Add Task
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddTaskForm;