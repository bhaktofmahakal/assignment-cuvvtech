import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  getCurrentUser: async (token: string) => {
    const response = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

export const usersAPI = {
  getUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },
  
  createUser: async (userData: any) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },
  
  updateUser: async (userId: number, userData: any) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
  
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

export const projectsAPI = {
  getProjects: async () => {
    const response = await api.get('/projects/');
    return response.data;
  },
  
  getProject: async (projectId: number) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },
  
  createProject: async (projectData: any) => {
    const response = await api.post('/projects/', projectData);
    return response.data;
  },
  
  updateProject: async (projectId: number, projectData: any) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },
  
  deleteProject: async (projectId: number) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },
};

export const tasksAPI = {
  getTasks: async (projectId?: number, assigneeId?: number) => {
    const params = new URLSearchParams();
    if (projectId) params.append('project_id', projectId.toString());
    if (assigneeId) params.append('assignee_id', assigneeId.toString());
    
    const response = await api.get(`/tasks/?${params}`);
    return response.data;
  },
  
  getTask: async (taskId: number) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },
  
  createTask: async (taskData: any) => {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  },
  
  updateTask: async (taskId: number, taskData: any) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },
  
  deleteTask: async (taskId: number) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },
  
  addComment: async (taskId: number, content: string) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { content, task_id: taskId });
    return response.data;
  },
};

export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getRecentActivity: async () => {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  },
};

export const aiAPI = {
  generateUserStories: async (projectDescription: string, projectId: number) => {
    const response = await api.post('/ai/generate-user-stories', {
      project_description: projectDescription,
      project_id: projectId,
    }, {
      timeout: 120000, // 2 minutes timeout for AI requests
    });
    return response.data;
  },
};

export default api;