import { describe, it, expect } from 'vitest';
import {
  normalizeCollegeId,
  validateCollegeId,
  validatePhone,
  sanitizeText,
  validateImageFile
} from '../validation.js';

describe('validation utilities', () => {
  describe('normalizeCollegeId', () => {
    it('trims whitespace and converts to uppercase', () => {
      expect(normalizeCollegeId('  cs2024a1  ')).toBe('CS2024A1');
      expect(normalizeCollegeId('stu-99')).toBe('STU-99');
    });

    it('returns empty string for non-string input', () => {
      expect(normalizeCollegeId(null)).toBe('');
      expect(normalizeCollegeId(undefined)).toBe('');
      expect(normalizeCollegeId(123)).toBe('');
    });
  });

  describe('validateCollegeId', () => {
    it('accepts valid uppercase alphanumeric IDs with hyphens', () => {
      expect(validateCollegeId('cs2401')).toEqual({
        valid: true,
        normalized: 'CS2401'
      });
      expect(validateCollegeId('ENG-2025-09')).toEqual({
        valid: true,
        normalized: 'ENG-2025-09'
      });
    });

    it('rejects empty IDs or IDs with special characters', () => {
      expect(validateCollegeId('   ').valid).toBe(false);
      expect(validateCollegeId('CS@2024!').valid).toBe(false);
      expect(validateCollegeId('CS 2024').valid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('accepts valid 10-digit numbers and strips formatting', () => {
      expect(validatePhone('9876543210')).toEqual({
        valid: true,
        cleaned: '9876543210'
      });
      expect(validatePhone('987-654-3210')).toEqual({
        valid: true,
        cleaned: '9876543210'
      });
    });

    it('rejects phone numbers shorter or longer than 10 digits', () => {
      expect(validatePhone('12345').valid).toBe(false);
      expect(validatePhone('123456789012').valid).toBe(false);
      expect(validatePhone('').valid).toBe(false);
    });
  });

  describe('sanitizeText', () => {
    it('trims text, strips control chars, and enforces max length', () => {
      expect(sanitizeText('  Hello\u0000World  ')).toBe('HelloWorld');
      expect(sanitizeText('abcdef', 3)).toBe('abc');
    });
  });

  describe('validateImageFile', () => {
    it('accepts valid image files within 5 MB', () => {
      const validFile = { type: 'image/png', size: 1024 * 500 };
      expect(validateImageFile(validFile)).toEqual({ valid: true });
      expect(validateImageFile(null)).toEqual({ valid: true });
    });

    it('rejects unsupported types or oversized files', () => {
      expect(validateImageFile({ type: 'application/pdf', size: 1000 }).valid).toBe(false);
      expect(validateImageFile({ type: 'image/jpeg', size: 6 * 1024 * 1024 }).valid).toBe(false);
    });
  });
});
