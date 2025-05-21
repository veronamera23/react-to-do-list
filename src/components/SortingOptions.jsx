// src/components/SortingOptions.jsx
import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

const SortingOptions = ({ sortBy, onSortChange }) => {
  return (
    <Box sx={{ mb: 2, width: '250px' }}>
      <FormControl fullWidth>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          label="Sort By"
        >
          <MenuItem value="dateAdded">Date Added</MenuItem>
          <MenuItem value="dueDate">Due Date</MenuItem>
          <MenuItem value="priority">Priority</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default SortingOptions;