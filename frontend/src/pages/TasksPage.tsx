import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete, Comment } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { tasksAPI, projectsAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TasksPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    project_id: '',
    assignee_id: '',
    due_date: null as Date | null,
  });

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading: tasksLoading } = useQuery('tasks', () => tasksAPI.getTasks());
  const { data: projects } = useQuery('projects', projectsAPI.getProjects);
  const { data: users } = useQuery('users', usersAPI.getUsers);

  const createMutation = useMutation(tasksAPI.createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      handleClose();
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => tasksAPI.updateTask(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        handleClose();
      },
    }
  );

  const deleteMutation = useMutation(tasksAPI.deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
    },
  });

  const handleOpen = (task?: any) => {
    if (task) {
      setEditTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        project_id: task.project_id.toString(),
        assignee_id: task.assignee_id?.toString() || '',
        due_date: task.due_date ? new Date(task.due_date) : null,
      });
    } else {
      setEditTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        project_id: '',
        assignee_id: '',
        due_date: null,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTask(null);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      project_id: parseInt(formData.project_id),
      assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null,
    };

    if (editTask) {
      updateMutation.mutate({ id: editTask.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(taskId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'default';
      case 'in_progress': return 'primary';
      case 'done': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  if (tasksLoading) return <LoadingSpinner />;

  const canManage = user?.role === 'admin' || user?.role === 'project_manager';
  const filteredTasks = user?.role === 'developer' 
    ? tasks?.filter((task: any) => task.assignee_id === user.id)
    : tasks;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Tasks</Typography>
          {canManage && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpen()}
            >
              New Task
            </Button>
          )}
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks?.map((task: any) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    {projects?.find((p: any) => p.id === task.project_id)?.name}
                  </TableCell>
                  <TableCell>
                    {task.assignee_id 
                      ? users?.find((u: any) => u.id === task.assignee_id)?.full_name
                      : 'Unassigned'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority.toUpperCase()}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {task.due_date 
                      ? new Date(task.due_date).toLocaleDateString()
                      : 'No due date'
                    }
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(task)}
                      disabled={user?.role === 'developer' && task.assignee_id !== user.id}
                    >
                      <Edit />
                    </IconButton>
                    {canManage && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {editTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Task Title"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Project</InputLabel>
              <Select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                label="Project"
              >
                {projects?.map((project: any) => (
                  <MenuItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={formData.assignee_id}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                label="Assignee"
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users?.map((user: any) => (
                  <MenuItem key={user.id} value={user.id.toString()}>
                    {user.full_name} ({user.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <DatePicker
              label="Due Date"
              value={formData.due_date}
              onChange={(newValue) => setFormData({ ...formData, due_date: newValue })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'dense',
                  sx: { mb: 2 }
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {editTask ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TasksPage;