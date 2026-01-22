import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} from '../../controllers/userController.js';
import User from '../../models/User.js';

vi.mock('../../models/User.js');

describe('User Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@test.com' },
        { _id: '2', name: 'User 2', email: 'user2@test.com' },
      ];

      User.find.mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockResolvedValue(mockUsers),
        }),
      });

      await getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        users: mockUsers,
        count: mockUsers.length,
      });
    });

    it('should handle errors', async () => {
      User.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error',
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = { _id: '123', name: 'Test User', email: 'test@test.com' };
      req.params.id = '123';

      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = '999';

      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const mockUser = { _id: '123', name: 'Updated User', isActive: false };
      req.params.id = '123';
      req.body = { isActive: false };

      User.findByIdAndUpdate.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = '999';
      req.body = { isActive: false };

      User.findByIdAndUpdate.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const mockUser = { _id: '123', name: 'To Delete' };
      req.params.id = '123';

      User.findByIdAndDelete.mockResolvedValue(mockUser);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User deleted successfully',
      });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = '999';

      User.findByIdAndDelete.mockResolvedValue(null);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockStats = [
        { _id: null, total: 10, active: 8, inactive: 2 },
      ];

      User.aggregate.mockResolvedValue(mockStats);
      User.countDocuments.mockResolvedValue(2);

      await getUserStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        stats: expect.objectContaining({
          totalUsers: expect.any(Number),
          activeUsers: expect.any(Number),
          adminUsers: expect.any(Number),
        }),
      });
    });
  });
});
