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
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const UsersPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'developer',
    is_active: true,
  });

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery('users', usersAPI.getUsers);

  const createMutation = useMutation(usersAPI.createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      handleClose();
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => usersAPI.updateUser(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        handleClose();
      },
    }
  );

  const deleteMutation = useMutation(usersAPI.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
    },
  });

  const handleOpen = (userData?: any) => {
    if (userData) {
      setEditUser(userData);
      setFormData({
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        password: '',
        role: userData.role,
        is_active: userData.is_active,
      });
    } else {
      setEditUser(null);
      setFormData({
        username: '',
        email: '',
        full_name: '',
        password: '',
        role: 'developer',
        is_active: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditUser(null);
  };

  const handleSubmit = () => {
    const data: any = { ...formData };
    
    if (editUser && !data.password) {
      delete data.password;
    }

    if (editUser) {
      updateMutation.mutate({ id: editUser.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (userId: number) => {
    if (userId === user?.id) {
      alert('You cannot delete your own account');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'project_manager': return 'primary';
      case 'developer': return 'success';
      default: return 'default';
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Users</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          New User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((userData: any) => (
              <TableRow key={userData.id}>
                <TableCell>{userData.full_name}</TableCell>
                <TableCell>{userData.username}</TableCell>
                <TableCell>{userData.email}</TableCell>
                <TableCell>
                  <Chip
                    label={userData.role.replace('_', ' ').toUpperCase()}
                    color={getRoleColor(userData.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={userData.is_active ? 'Active' : 'Inactive'}
                    color={userData.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(userData)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(userData.id)}
                    disabled={userData.id === user?.id}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            fullWidth
            variant="outlined"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Username"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={editUser ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            sx={{ mb: 2 }}
            required={!editUser}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="project_manager">Project Manager</MenuItem>
              <MenuItem value="developer">Developer</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            {editUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;