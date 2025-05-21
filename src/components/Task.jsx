// src/components/Task.jsx
import React from 'react';
import { 
  ListItem, 
  ListItemText, 
  Checkbox, 
  IconButton, 
  Chip,
  Typography,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';

const Task = ({ task, onDelete, onEdit, onToggleComplete }) => {
  const { id, title, completed, priority, dueDate } = task;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const isOverdue = dueDate && new Date(dueDate) < new Date() && !completed;

  return (
    <ListItem
      sx={{
        mb: 1,
        bgcolor: '#fff',
        borderRadius: 1,
        border: '1px solid',
        borderColor: isOverdue ? 'error.light' : 'grey.300',
        '&:hover': { bgcolor: '#f5f5f5' }
      }}
      secondaryAction={
        <>
          <IconButton edge="end" onClick={() => onEdit(task)} sx={{ mr: 1 }}>
            <EditIcon />
          </IconButton>
          <IconButton edge="end" onClick={() => onDelete(id)}>
            <DeleteIcon />
          </IconButton>
        </>
      }
    >
      <Checkbox
        checked={completed}
        onChange={() => onToggleComplete(id)}
        edge="start"
        sx={{ mr: 1 }}
      />
      <ListItemText
        primary={
          <Typography
            component="span"
            sx={{
              textDecoration: completed ? 'line-through' : 'none',
              color: completed ? 'text.disabled' : 'text.primary'
            }}
          >
            {title}
          </Typography>
        }
        secondary={
          <React.Fragment>
            {/* Created At */}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: '#b39ddb',
                mt: 1,
                fontStyle: 'italic',
                fontSize: '0.85rem'
              }}
            >
              Created: {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy h:mm a') : ''}
            </Typography>
            {/* Due Date & Priority */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              {dueDate && (
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    color: isOverdue ? 'error.main' : 'text.secondary'
                  }}
                >
                  {isOverdue ? 'OVERDUE: ' : 'Due: '}
                  {formatDueDate(dueDate)}
                </Typography>
              )}
              <Chip 
                size="small" 
                label={priority.toUpperCase()} 
                color={getPriorityColor(priority)}
              />
            </Box>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};

export default Task;