import { describe, it, expect } from 'vitest';
import { validateISBN, validateISBN10, validateISBN13, formatISBN } from '../../utils/isbnValidator.js';

describe('ISBN Validation', () => {
  describe('validateISBN10', () => {
    it('should validate correct ISBN-10', () => {
      expect(validateISBN10('0306406152')).toBe(true);
      expect(validateISBN10('0-306-40615-2')).toBe(true);
    });

    it('should validate ISBN-10 with X check digit', () => {
      expect(validateISBN10('043942089X')).toBe(true);
      expect(validateISBN10('0-439-42089-X')).toBe(true);
    });

    it('should reject invalid ISBN-10', () => {
      expect(validateISBN10('0306406151')).toBe(false);
      expect(validateISBN10('1234567890')).toBe(false);
    });

    it('should reject wrong length', () => {
      expect(validateISBN10('123')).toBe(false);
      expect(validateISBN10('12345678901234')).toBe(false);
    });
  });

  describe('validateISBN13', () => {
    it('should validate correct ISBN-13', () => {
      expect(validateISBN13('9780306406157')).toBe(true);
      expect(validateISBN13('978-0-306-40615-7')).toBe(true);
    });

    it('should reject invalid ISBN-13', () => {
      expect(validateISBN13('9780306406150')).toBe(false);
      expect(validateISBN13('9781234567890')).toBe(false);
    });

    it('should reject wrong length', () => {
      expect(validateISBN13('123')).toBe(false);
      expect(validateISBN13('12345678901')).toBe(false);
    });

    it('should reject non-numeric ISBN-13', () => {
      expect(validateISBN13('978030640615X')).toBe(false);
    });
  });

  describe('validateISBN', () => {
    it('should validate ISBN-10 and return type', () => {
      const result = validateISBN('0306406152');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('ISBN-10');
    });

    it('should validate ISBN-13 and return type', () => {
      const result = validateISBN('9780306406157');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('ISBN-13');
    });

    it('should return error for invalid ISBN', () => {
      const result = validateISBN('1234567890');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should handle empty or invalid input', () => {
      expect(validateISBN('').isValid).toBe(false);
      expect(validateISBN(null).isValid).toBe(false);
      expect(validateISBN(undefined).isValid).toBe(false);
    });

    it('should handle wrong length', () => {
      const result = validateISBN('12345');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('10 or 13 characters');
    });
  });

  describe('formatISBN', () => {
    it('should format ISBN-10 with hyphens', () => {
      expect(formatISBN('0306406152')).toBe('0-306-40615-2');
    });

    it('should format ISBN-13 with hyphens', () => {
      expect(formatISBN('9780306406157')).toBe('978-0-306-40615-7');
    });

    it('should preserve already formatted ISBN', () => {
      const isbn = '978-0-306-40615-7';
      expect(formatISBN(isbn)).toBe(isbn);
    });

    it('should return original for invalid length', () => {
      expect(formatISBN('12345')).toBe('12345');
    });
  });
});
