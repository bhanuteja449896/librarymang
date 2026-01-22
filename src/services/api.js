import api from '../utils/api';

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
};

// Book services
export const bookService = {
  getAllBooks: async (params) => {
    const response = await api.get('/books', { params });
    return response.data;
  },

  getBookById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  createBook: async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },

  updateBook: async (id, bookData) => {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  },

  deleteBook: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },

  getBookStats: async () => {
    const response = await api.get('/books/stats/overview');
    return response.data;
  },
};

// Borrow services
export const borrowService = {
  borrowBook: async (bookId) => {
    const response = await api.post('/borrows', { bookId });
    return response.data;
  },

  returnBook: async (borrowId) => {
    const response = await api.put(`/borrows/${borrowId}/return`);
    return response.data;
  },

  getMyBorrows: async (status) => {
    const params = status ? { status } : {};
    const response = await api.get('/borrows/my-borrows', { params });
    return response.data;
  },

  getAllBorrows: async (params) => {
    const response = await api.get('/borrows', { params });
    return response.data;
  },

  payFine: async (borrowId) => {
    const response = await api.put(`/borrows/${borrowId}/pay-fine`);
    return response.data;
  },

  getBorrowStats: async () => {
    const response = await api.get('/borrows/stats/overview');
    return response.data;
  },
};

// User services
export const userService = {
  getAllUsers: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/users/stats/overview');
    return response.data;
  },
};
