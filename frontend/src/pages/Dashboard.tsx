import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Assignment,
  Task,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery('dashboard-stats', dashboardAPI.getStats);
  const { data: activity, isLoading: activityLoading } = useQuery('recent-activity', dashboardAPI.getRecentActivity);

  if (statsLoading || activityLoading) {
    return <LoadingSpinner />;
  }

  const StatCard = ({ title, value, icon, color = 'primary' }: any) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'default';
      case 'in_progress': return 'primary';
      case 'done': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={stats?.overview?.total_projects || 0}
            icon={<Assignment fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Projects"
            value={stats?.overview?.active_projects || 0}
            icon={<Assignment fontSize="large" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Tasks"
            value={stats?.overview?.my_tasks || 0}
            icon={<Task fontSize="large" />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats?.overview?.my_completed_tasks || 0}
            icon={<CheckCircle fontSize="large" />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Distribution
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">To Do</Typography>
                  <Typography variant="body2">{stats?.task_distribution?.todo || 0}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats?.task_distribution?.todo || 0) / (stats?.overview?.total_tasks || 1) * 100}
                  sx={{ mb: 2 }}
                />
              </Box>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">In Progress</Typography>
                  <Typography variant="body2">{stats?.task_distribution?.in_progress || 0}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats?.task_distribution?.in_progress || 0) / (stats?.overview?.total_tasks || 1) * 100}
                  color="secondary"
                  sx={{ mb: 2 }}
                />
              </Box>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Completed</Typography>
                  <Typography variant="body2">{stats?.task_distribution?.completed || 0}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats?.task_distribution?.completed || 0) / (stats?.overview?.total_tasks || 1) * 100}
                  color="success"
                  sx={{ mb: 2 }}
                />
              </Box>
              {(stats?.task_distribution?.overdue || 0) > 0 && (
                <Box display="flex" alignItems="center" color="error.main">
                  <Warning sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {stats.task_distribution.overdue} overdue tasks
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Progress
              </Typography>
              <List dense>
                {stats?.project_progress?.slice(0, 5).map((project: any) => (
                  <ListItem key={project.id}>
                    <ListItemText
                      primary={project.name}
                      secondary={
                        <Box>
                          <Box display="flex" justifyContent="space-between" mt={1}>
                            <Typography variant="caption">
                              {project.completed_tasks}/{project.total_tasks} tasks
                            </Typography>
                            <Typography variant="caption">
                              {project.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={project.progress}
                            sx={{ mt: 1 }}
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

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {activity?.recent_activity?.slice(0, 8).map((item: any, index: number) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Typography variant="caption" color="textSecondary">
                            {item.project_name}
                          </Typography>
                          <Chip
                            label={item.status.replace('_', ' ')}
                            size="small"
                            color={getStatusColor(item.status)}
                          />
                          {item.assignee_name && (
                            <Typography variant="caption" color="textSecondary">
                              • {item.assignee_name}
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
      </Grid>
    </Box>
  );
};

export default Dashboard;