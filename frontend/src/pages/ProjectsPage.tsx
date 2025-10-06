import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  LinearProgress,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectsPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    manager_id: '',
    member_ids: [],
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: projects, isLoading: projectsLoading } = useQuery('projects', projectsAPI.getProjects);
  const { data: users } = useQuery('users', usersAPI.getUsers);

  const createMutation = useMutation(projectsAPI.createProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      handleClose();
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => projectsAPI.updateProject(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        handleClose();
      },
    }
  );

  const deleteMutation = useMutation(projectsAPI.deleteProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
    },
  });

  const handleOpen = (project?: any) => {
    if (project) {
      setEditProject(project);
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status,
        manager_id: project.manager_id.toString(),
        member_ids: project.members?.map((m: any) => m.id) || [],
      });
    } else {
      setEditProject(null);
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        manager_id: user?.role === 'project_manager' ? user.id.toString() : '',
        member_ids: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProject(null);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      manager_id: parseInt(formData.manager_id),
      member_ids: formData.member_ids,
    };

    if (editProject) {
      updateMutation.mutate({ id: editProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (projectId: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(projectId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'default';
      case 'in_progress': return 'primary';
      case 'on_hold': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (projectsLoading) return <LoadingSpinner />;

  const canManage = user?.role === 'admin' || user?.role === 'project_manager';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects</Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
          >
            New Project
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {projects?.map((project: any) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {project.description || 'No description'}
                </Typography>
                <Box mb={2}>
                  <Chip
                    label={project.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Manager: {project.manager?.full_name}
                </Typography>
                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">
                      Progress ({project.completed_tasks}/{project.task_count})
                    </Typography>
                    <Typography variant="body2">
                      {project.progress_percentage.toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress_percentage}
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  View
                </Button>
                {canManage && (
                  <>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpen(project)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(project.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editProject ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="on_hold">On Hold</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          {user?.role === 'admin' && (
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Manager</InputLabel>
              <Select
                value={formData.manager_id}
                onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                label="Manager"
              >
                {users?.filter((u: any) => u.role === 'project_manager' || u.role === 'admin')
                  .map((user: any) => (
                    <MenuItem key={user.id} value={user.id.toString()}>
                      {user.full_name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
          <FormControl fullWidth margin="dense">
            <InputLabel>Team Members</InputLabel>
            <Select
              multiple
              value={formData.member_ids}
              onChange={(e) => setFormData({ ...formData, member_ids: e.target.value as any })}
              label="Team Members"
            >
              {users?.map((user: any) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.full_name} ({user.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            {editProject ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsPage;