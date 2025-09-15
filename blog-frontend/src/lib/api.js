import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";



// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  verifyToken: () => api.get('/auth/verify'),
};

// Blog API
export const blogAPI = {
  getBlogs: (params = {}) => api.get('/blogs', { params }),
  getBlog: (slug) => api.get(`/blogs/${slug}`),
  getBlogForEdit: (id) => api.get(`/blogs/edit/${id}`),
  createBlog: (blogData) => api.post('/blogs', blogData),
  updateBlog: (id, blogData) => api.put(`/blogs/${id}`, blogData),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  getUserBlogs: (params = {}) => api.get('/blogs/user/my-blogs', { params }),
  likeBlog: (id) => api.post(`/blogs/${id}/like`),
  addComment: (id, comment) => api.post(`/blogs/${id}/comments`, comment),
  getCategories: () => api.get('/blogs/meta/categories'),
  getTags: () => api.get('/blogs/meta/tags'),
};

export default api;

