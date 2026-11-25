/**
 * Validation and sanitization utilities for Lostfusion.
 */

const COLLEGE_ID_REGEX = /^[A-Z0-9-]+$/;
const PHONE_REGEX = /^\d{10}$/;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Normalizes a College ID to trimmed uppercase.
 * @param {string} value
 * @returns {string}
 */
export function normalizeCollegeId(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toUpperCase();
}

/**
 * Validates that a College ID is non-empty and contains only uppercase letters, numbers, or hyphens.
 * @param {string} collegeId
 * @returns {{ valid: boolean, normalized: string, error?: string }}
 */
export function validateCollegeId(collegeId) {
  const normalized = normalizeCollegeId(collegeId);
  if (!normalized) {
    return { valid: false, normalized, error: 'College ID is required.' };
  }
  if (normalized === 'HEAD_ADMIN') {
    return { valid: true, normalized };
  }
  if (!COLLEGE_ID_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'College ID must contain only letters (A-Z), numbers (0-9), and hyphens.'
    };
  }
  return { valid: true, normalized };
}

/**
 * Strips non-digit characters and validates a 10-digit phone number.
 * @param {string} phone
 * @returns {{ valid: boolean, cleaned: string, error?: string }}
 */
export function validatePhone(phone) {
  const cleaned = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';
  if (!PHONE_REGEX.test(cleaned)) {
    return {
      valid: false,
      cleaned,
      error: 'Phone number must be exactly 10 digits.'
    };
  }
  return { valid: true, cleaned };
}

/**
 * Sanitizes plain text input by trimming and collapsing excessive control characters.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeText(text, maxLength = 1000) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates an uploaded image file type and size.
 * @param {File|null|undefined} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) return { valid: true };
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported image format. Please upload JPEG, PNG, WebP, or GIF.'
    };
  }
  if (typeof file.size === 'number' && file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Image size must be 5 MB or less.'
    };
  }
  return { valid: true };
}
