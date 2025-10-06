import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { projectsAPI, tasksAPI, aiAPI, usersAPI } from '../services/api';
import { userStoriesAPI, UserStory } from '../services/userStoriesAPI';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { AutoAwesome } from '@mui/icons-material';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery(
    ['project', id],
    () => projectsAPI.getProject(parseInt(id!)),
    { enabled: !!id }
  );

  const { data: tasks } = useQuery(
    ['tasks', id],
    () => tasksAPI.getTasks(parseInt(id!)),
    { enabled: !!id }
  );

  const { data: users } = useQuery(
    ['users'],
    () => usersAPI.getUsers()
  );

  const { data: userStoriesData } = useQuery(
    ['user-stories', id],
    () => userStoriesAPI.getUserStoriesByProject(parseInt(id!)),
    { enabled: !!id }
  );

  const aiMutation = useMutation(
    ({ description, projectId }: { description: string; projectId: number }) =>
      aiAPI.generateUserStories(description, projectId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', id]);
        queryClient.invalidateQueries(['user-stories', id]);
        setAiDialogOpen(false);
        setProjectDescription('');
        setAiLoading(false);
      },
      onError: (error: any) => {
        setAiLoading(false);
        setError(error.response?.data?.detail || error.message || 'Failed to generate user stories. Please try again.');
      }
    }
  );

  const handleGenerateStories = () => {
    setAiLoading(true);
    setError(null);
    aiMutation.mutate({
      description: projectDescription,
      projectId: parseInt(id!)
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (!project) return <Typography>Project not found</Typography>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'default';
      case 'in_progress': return 'primary';
      case 'done': return 'success';
      default: return 'default';
    }
  };

  const canManage = user?.role === 'admin' || 
    (user?.role === 'project_manager' && project.manager_id === user.id);

  const todoTasks = tasks?.filter((t: any) => t.status === 'todo') || [];
  const inProgressTasks = tasks?.filter((t: any) => t.status === 'in_progress') || [];
  const doneTasks = tasks?.filter((t: any) => t.status === 'done') || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{project.name}</Typography>
        {canManage && (
          <Button
            variant="outlined"
            startIcon={<AutoAwesome />}
            onClick={() => setAiDialogOpen(true)}
          >
            Generate User Stories
          </Button>
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Details
              </Typography>
              <Typography variant="body1" paragraph>
                {project.description || 'No description provided'}
              </Typography>
              <Box display="flex" gap={2} mb={2}>
                <Chip
                  label={project.status.replace('_', ' ').toUpperCase()}
                  color={project.status === 'in_progress' ? 'primary' : 'default'}
                />
                <Typography variant="body2" color="textSecondary">
                  Manager: {project.manager?.full_name}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Progress: {project.completed_tasks}/{project.task_count} tasks completed
              </Typography>
              <LinearProgress
                variant="determinate"
                value={project.progress_percentage}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Team Members
              </Typography>
              <List dense>
                {project.members?.map((member: any) => (
                  <ListItem key={member.id}>
                    <ListItemText
                      primary={member.full_name}
                      secondary={member.role.replace('_', ' ')}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Stories Section */}
      {userStoriesData?.user_stories && userStoriesData.user_stories.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            User Stories ({userStoriesData.user_stories.length})
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {userStoriesData.user_stories.map((story: UserStory) => (
              <Grid item xs={12} md={6} lg={4} key={story.id}>
                <Card sx={{ height: '100%', border: '1px solid', borderColor: 'primary.light' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      {story.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {story.description}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                      Created: {new Date(story.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Typography variant="h5" gutterBottom>
        Task Board
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                To Do ({todoTasks.length})
              </Typography>
              <List dense>
                {todoTasks.map((task: any) => (
                  <ListItem key={task.id} sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <Box>
                          <Chip
                            label={task.priority}
                            size="small"
                            color={task.priority === 'high' ? 'error' : 'default'}
                          />
                          {task.assignee_id && (
                            <Typography variant="caption" display="block">
                              Assigned to: {users?.find((u: any) => u.id === task.assignee_id)?.full_name}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                In Progress ({inProgressTasks.length})
              </Typography>
              <List dense>
                {inProgressTasks.map((task: any) => (
                  <ListItem key={task.id} sx={{ bgcolor: 'primary.light', mb: 1, borderRadius: 1, color: 'white' }}>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <Box>
                          <Chip
                            label={task.priority}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success.main">
                Done ({doneTasks.length})
              </Typography>
              <List dense>
                {doneTasks.map((task: any) => (
                  <ListItem key={task.id} sx={{ bgcolor: 'success.light', mb: 1, borderRadius: 1, color: 'white' }}>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <Chip
                          label="Completed"
                          size="small"
                          variant="outlined"
                        />
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog 
        open={aiDialogOpen} 
        onClose={() => setAiDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        disableRestoreFocus
        keepMounted={false}
        aria-labelledby="ai-dialog-title"
        aria-describedby="ai-dialog-description"
      >
        <DialogTitle id="ai-dialog-title">Generate User Stories with AI</DialogTitle>
        <DialogContent>
          <Typography id="ai-dialog-description" variant="body2" color="textSecondary" paragraph>
            Describe your project to generate user stories automatically using AI.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Project Description"
            placeholder="Example: An ecommerce website where customers can browse products, add to cart, and make payments online. Admin should manage products and view orders."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateStories}
            variant="contained"
            disabled={!projectDescription.trim() || aiLoading}
            startIcon={aiLoading ? <LoadingSpinner size={20} /> : <AutoAwesome />}
          >
            {aiLoading ? 'Generating...' : 'Generate Stories'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetailPage;