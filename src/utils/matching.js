import { isReportResolved } from './reportHelpers.js';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'is', 'was', 'my', 'i', 'it', 'this', 'that', 'near', 'from',
  'lost', 'found', 'item', 'campus'
]);

/**
 * Tokenizes a string into meaningful lowercase keywords.
 * @param {string} text
 * @returns {Set<string>}
 */
export function tokenize(text) {
  if (!text || typeof text !== 'string') return new Set();
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
  return new Set(words);
}

/**
 * Finds potential opposite-type (Lost <-> Found) matches for a target report.
 * Uses category alignment, location overlap, and title/description keyword similarity.
 *
 * @param {object} targetItem
 * @param {Array} allReports
 * @param {number} maxResults
 * @returns {Array<{ item: object, score: number, reasons: string[] }>}
 */
export function findSmartMatches(targetItem, allReports, maxResults = 3) {
  if (!targetItem || !Array.isArray(allReports)) return [];

  const targetType = targetItem.reportType || targetItem.status || 'Lost';
  if (targetType === 'Resolved' || isReportResolved(targetItem)) return [];

  const oppositeType = targetType === 'Lost' ? 'Found' : 'Lost';
  const targetTitleTokens = tokenize(targetItem.title);
  const targetDescTokens = tokenize(`${targetItem.title || ''} ${targetItem.description || ''}`);
  const targetLocTokens = tokenize(targetItem.location);

  const scored = [];

  for (const candidate of allReports) {
    if (!candidate || candidate.id === targetItem.id) continue;
    if (isReportResolved(candidate)) continue;

    const candidateType = candidate.reportType || candidate.status || 'Lost';
    if (candidateType !== oppositeType) continue;

    let score = 0;
    const reasons = [];

    // 1. Category match (+35)
    if (targetItem.category && candidate.category && targetItem.category === candidate.category) {
      score += 35;
      reasons.push(`Same category (${candidate.category})`);
    }

    // 2. Title keyword overlap (+40 max)
    const candTitleTokens = tokenize(candidate.title);
    let titleOverlap = 0;
    for (const token of targetTitleTokens) {
      if (candTitleTokens.has(token)) titleOverlap += 1;
    }
    if (titleOverlap > 0 && targetTitleTokens.size > 0) {
      const titleScore = Math.min(40, Math.round((titleOverlap / Math.min(targetTitleTokens.size, candTitleTokens.size)) * 40));
      score += titleScore;
      reasons.push('Matching item keywords');
    }

    // 3. Combined description keyword overlap (+15 max)
    const candDescTokens = tokenize(`${candidate.title || ''} ${candidate.description || ''}`);
    let descOverlap = 0;
    for (const token of targetDescTokens) {
      if (candDescTokens.has(token)) descOverlap += 1;
    }
    if (descOverlap > 0 && targetDescTokens.size > 0) {
      score += Math.min(15, descOverlap * 5);
    }

    // 4. Location overlap (+20 max)
    const candLocTokens = tokenize(candidate.location);
    let locOverlap = 0;
    for (const token of targetLocTokens) {
      if (candLocTokens.has(token)) locOverlap += 1;
    }
    if (locOverlap > 0) {
      score += 20;
      reasons.push('Similar campus location');
    }

    // Only surface meaningful matches (>= 40% confidence)
    if (score >= 40) {
      scored.push({
        item: candidate,
        score: Math.min(99, score),
        reasons
      });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
