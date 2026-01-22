import { describe, it, expect, vi } from 'vitest';
import { errorHandler, notFound } from '../../middleware/error.js';

describe('Error Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      originalUrl: '/test-url',
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      statusCode: 200,
    };
    next = vi.fn();
  });

  describe('notFound middleware', () => {
    it('should create 404 error', () => {
      notFound(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(next).toHaveBeenCalled();
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(Error);
      expect(errorArg.message).toContain('Not Found');
      expect(errorArg.message).toContain('/test-url');
    });
  });

  describe('errorHandler middleware', () => {
    it('should handle errors with custom status code', () => {
      const err = new Error('Test error');
      res.statusCode = 400;

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Test error',
        stack: expect.any(String),
      });
    });

    it('should default to 500 for status 200', () => {
      const err = new Error('Internal error');
      res.statusCode = 200;

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should hide stack trace in production', () => {
      const err = new Error('Production error');
      process.env.NODE_ENV = 'production';
      res.statusCode = 500;

      errorHandler(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Production error',
        stack: null,
      });

      process.env.NODE_ENV = 'test';
    });
  });
});
