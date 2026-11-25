import { describe, it, expect } from 'vitest';
import { findSmartMatches, tokenize } from '../matching.js';

describe('smart matching engine', () => {
  it('tokenizes text and removes stop words', () => {
    const tokens = tokenize('Lost my Black Dell Laptop near the Library');
    expect(tokens.has('black')).toBe(true);
    expect(tokens.has('dell')).toBe(true);
    expect(tokens.has('laptop')).toBe(true);
    expect(tokens.has('library')).toBe(true);
    expect(tokens.has('the')).toBe(false);
    expect(tokens.has('lost')).toBe(false);
  });

  it('matches Lost item with relevant Found items by category, keywords, and location', () => {
    const lostItem = {
      id: '1',
      title: 'Black Dell XPS Laptop',
      description: 'Left in a black sleeve on 2nd floor',
      category: 'Electronics',
      location: 'Central Library',
      reportType: 'Lost',
      status: 'Lost'
    };

    const reports = [
      lostItem,
      {
        id: '2',
        title: 'Found Dell Laptop in Sleeve',
        description: 'Black laptop found at Library 2nd floor',
        category: 'Electronics',
        location: 'Central Library',
        reportType: 'Found',
        status: 'Found'
      },
      {
        id: '3',
        title: 'Red Umbrella',
        description: 'Left near gate',
        category: 'Accessories',
        location: 'Main Gate',
        reportType: 'Found',
        status: 'Found'
      },
      {
        id: '4',
        title: 'Dell Laptop Charger',
        description: 'Found and returned',
        category: 'Electronics',
        location: 'Central Library',
        reportType: 'Found',
        status: 'Resolved',
        is_resolved: true
      }
    ];

    const matches = findSmartMatches(lostItem, reports);
    expect(matches).toHaveLength(1);
    expect(matches[0].item.id).toBe('2');
    expect(matches[0].score).toBeGreaterThanOrEqual(70);
    expect(matches[0].reasons).toContain('Same category (Electronics)');
  });

  it('returns empty array for resolved items', () => {
    const resolvedItem = {
      id: '1',
      title: 'Keys',
      category: 'Keys',
      reportType: 'Lost',
      status: 'Resolved',
      is_resolved: true
    };
    expect(findSmartMatches(resolvedItem, [resolvedItem])).toEqual([]);
  });
});
