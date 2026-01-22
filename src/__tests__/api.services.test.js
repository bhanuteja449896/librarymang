import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService, bookService, borrowService, userService } from '../services/api';
import api from '../utils/api';

vi.mock('../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authService', () => {
    it('should call register endpoint', async () => {
      const userData = { name: 'Test', email: 'test@test.com', password: '123' };
      api.post.mockResolvedValue({ data: { user: userData, token: 'token' } });

      await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
    });

    it('should call login endpoint', async () => {
      const credentials = { email: 'test@test.com', password: '123' };
      api.post.mockResolvedValue({ data: { user: {}, token: 'token' } });

      await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
    });

    it('should call getMe endpoint', async () => {
      api.get.mockResolvedValue({ data: { user: {} } });

      await authService.getMe();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
    });

    it('should call updateProfile endpoint', async () => {
      const userData = { name: 'Updated Name' };
      api.put.mockResolvedValue({ data: { user: userData } });

      await authService.updateProfile(userData);

      expect(api.put).toHaveBeenCalledWith('/auth/profile', userData);
    });
  });

  describe('bookService', () => {
    it('should call getBooks endpoint', async () => {
      api.get.mockResolvedValue({ data: { books: [] } });

      await bookService.getBooks();

      expect(api.get).toHaveBeenCalledWith('/books', { params: {} });
    });

    it('should call getBooks with params', async () => {
      const params = { search: 'test', genre: 'Fiction' };
      api.get.mockResolvedValue({ data: { books: [] } });

      await bookService.getBooks(params);

      expect(api.get).toHaveBeenCalledWith('/books', { params });
    });

    it('should call createBook endpoint', async () => {
      const bookData = { title: 'Test Book', author: 'Test Author' };
      api.post.mockResolvedValue({ data: { book: bookData } });

      await bookService.createBook(bookData);

      expect(api.post).toHaveBeenCalledWith('/books', bookData);
    });

    it('should call updateBook endpoint', async () => {
      const bookData = { title: 'Updated Book' };
      api.put.mockResolvedValue({ data: { book: bookData } });

      await bookService.updateBook('123', bookData);

      expect(api.put).toHaveBeenCalledWith('/books/123', bookData);
    });

    it('should call deleteBook endpoint', async () => {
      api.delete.mockResolvedValue({ data: {} });

      await bookService.deleteBook('123');

      expect(api.delete).toHaveBeenCalledWith('/books/123');
    });
  });

  describe('borrowService', () => {
    it('should call borrowBook endpoint', async () => {
      api.post.mockResolvedValue({ data: { borrow: {} } });

      await borrowService.borrowBook('book123');

      expect(api.post).toHaveBeenCalledWith('/borrows', { bookId: 'book123' });
    });

    it('should call returnBook endpoint', async () => {
      api.put.mockResolvedValue({ data: { borrow: {} } });

      await borrowService.returnBook('borrow123');

      expect(api.put).toHaveBeenCalledWith('/borrows/borrow123/return');
    });

    it('should call getMyBorrows endpoint', async () => {
      api.get.mockResolvedValue({ data: { borrows: [] } });

      await borrowService.getMyBorrows();

      expect(api.get).toHaveBeenCalledWith('/borrows/my');
    });

    it('should call getAllBorrows endpoint', async () => {
      api.get.mockResolvedValue({ data: { borrows: [] } });

      await borrowService.getAllBorrows();

      expect(api.get).toHaveBeenCalledWith('/borrows');
    });

    it('should call payFine endpoint', async () => {
      api.patch.mockResolvedValue({ data: { borrow: {} } });

      await borrowService.payFine('borrow123');

      expect(api.patch).toHaveBeenCalledWith('/borrows/borrow123/pay');
    });

    it('should call getBorrowStats endpoint', async () => {
      api.get.mockResolvedValue({ data: { stats: {} } });

      await borrowService.getBorrowStats();

      expect(api.get).toHaveBeenCalledWith('/borrows/stats');
    });
  });

  describe('userService', () => {
    it('should call getUsers endpoint', async () => {
      api.get.mockResolvedValue({ data: { users: [] } });

      await userService.getUsers();

      expect(api.get).toHaveBeenCalledWith('/users');
    });

    it('should call updateUser endpoint', async () => {
      const userData = { isActive: false };
      api.put.mockResolvedValue({ data: { user: userData } });

      await userService.updateUser('user123', userData);

      expect(api.put).toHaveBeenCalledWith('/users/user123', userData);
    });

    it('should call deleteUser endpoint', async () => {
      api.delete.mockResolvedValue({ data: {} });

      await userService.deleteUser('user123');

      expect(api.delete).toHaveBeenCalledWith('/users/user123');
    });

    it('should call getUserStats endpoint', async () => {
      api.get.mockResolvedValue({ data: { stats: {} } });

      await userService.getUserStats();

      expect(api.get).toHaveBeenCalledWith('/users/stats');
    });
  });
});
