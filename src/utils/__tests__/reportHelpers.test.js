import { describe, it, expect } from 'vitest';
import {
  isReportResolved,
  isReportOwner,
  extractStorageFileName,
  filterReports,
  getReportStats
} from '../reportHelpers.js';

describe('reportHelpers', () => {
  describe('isReportResolved', () => {
    it('returns true when status is Resolved or is_resolved is true', () => {
      expect(isReportResolved({ status: 'Resolved' })).toBe(true);
      expect(isReportResolved({ is_resolved: true, status: 'Lost' })).toBe(true);
      expect(isReportResolved({ status: 'Lost', is_resolved: false })).toBe(false);
      expect(isReportResolved(null)).toBe(false);
    });
  });

  describe('isReportOwner', () => {
    it('matches by uid or case-insensitive collegeid', () => {
      expect(isReportOwner({ user_id: 'u1' }, { uid: 'u1' }, null)).toBe(true);
      expect(isReportOwner({ collegeid: 'CS101' }, null, 'cs101')).toBe(true);
      expect(isReportOwner({ collegeid: 'CS102' }, { uid: 'u2' }, 'CS101')).toBe(false);
    });
  });

  describe('extractStorageFileName', () => {
    it('extracts filename from Supabase public URL', () => {
      const url = 'https://example.supabase.co/storage/v1/object/public/images/123-photo%20name.png';
      expect(extractStorageFileName(url)).toBe('123-photo name.png');
    });

    it('returns null for invalid or empty URLs', () => {
      expect(extractStorageFileName('')).toBeNull();
      expect(extractStorageFileName('https://example.com/other.png')).toBeNull();
    });
  });

  describe('filterReports & getReportStats', () => {
    const sample = [
      { id: 1, title: 'Dell Laptop', category: 'Electronics', location: 'Main Library', reportType: 'Lost', status: 'Lost' },
      { id: 2, title: 'Blue Water Bottle', category: 'Accessories', location: 'Cafeteria', reportType: 'Found', status: 'Found' },
      { id: 3, title: 'Lab Keys', category: 'Keys', location: 'Science Block', reportType: 'Lost', status: 'Resolved', is_resolved: true }
    ];

    it('filters by type, category, location, and search query', () => {
      expect(filterReports(sample, { filterType: 'lost' })).toHaveLength(1);
      expect(filterReports(sample, { filterType: 'found' })).toHaveLength(1);
      expect(filterReports(sample, { filterType: 'resolved' })).toHaveLength(1);
      expect(filterReports(sample, { filterCategory: 'Electronics' })).toHaveLength(1);
      expect(filterReports(sample, { filterLocation: 'Library' })).toHaveLength(1);
      expect(filterReports(sample, { searchQuery: 'bottle' })).toHaveLength(1);
    });

    it('computes accurate statistics', () => {
      expect(getReportStats(sample)).toEqual({
        total: 3,
        lostActive: 1,
        foundActive: 1,
        resolved: 1
      });
    });
  });
});
