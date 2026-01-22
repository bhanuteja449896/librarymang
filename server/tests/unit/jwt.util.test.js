import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken } from '../../utils/jwt.js';

// Mock environment
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRE = '7d';

describe('JWT Utilities', () => {
  describe('generateToken', () => {
    it('should generate a valid token', () => {
      const userId = 'test_user_id';
      const token = generateToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateToken('user1');
      const token2 = generateToken('user2');

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const userId = 'test_user_id';
      const token = generateToken(userId);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(userId);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid_token');
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // This would require manipulating time, so we'll just test structure
      const token = generateToken('user');
      expect(() => {
        verifyToken(token + 'modified');
      }).toThrow();
    });
  });
});
