import { describe, it, expect, vi, beforeEach } from 'vitest';
import { protect, admin } from '../../middleware/auth.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

vi.mock('../../models/User.js');
vi.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe('protect middleware', () => {
    it('should call next() for valid token', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
      };

      req.headers.authorization = 'Bearer valid_token';
      jwt.verify.mockReturnValue({ id: 'user123' });
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      await protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('should return 401 if no token provided', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not authorized, no token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', async () => {
      req.headers.authorization = 'Bearer invalid_token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is inactive', async () => {
      const mockUser = {
        _id: 'user123',
        isActive: false,
      };

      req.headers.authorization = 'Bearer valid_token';
      jwt.verify.mockReturnValue({ id: 'user123' });
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User account is deactivated',
      });
    });
  });

  describe('admin middleware', () => {
    it('should call next() for admin user', () => {
      req.user = { role: 'admin' };

      admin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 for non-admin user', () => {
      req.user = { role: 'user' };

      admin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not authorized as admin',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if no user', () => {
      admin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
