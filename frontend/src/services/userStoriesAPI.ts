import api from './api';

export interface UserStory {
  id: number;
  title: string;
  description: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface UserStoriesResponse {
  user_stories: UserStory[];
  total: number;
}

export const userStoriesAPI = {
  getUserStoriesByProject: (projectId: number): Promise<UserStoriesResponse> =>
    api.get(`/user-stories/project/${projectId}`).then(res => res.data),
};