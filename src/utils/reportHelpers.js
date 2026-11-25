/**
 * Helper functions for report status, ownership, filtering, and storage URLs.
 */

/**
 * Returns whether a report is marked resolved.
 * @param {object} item
 * @returns {boolean}
 */
export function isReportResolved(item) {
  if (!item) return false;
  return item.is_resolved === true || item.status === 'Resolved';
}

/**
 * Determines whether the current user owns a report (matching UID or College ID).
 * @param {object} item
 * @param {object|null} currentUser
 * @param {string|null|undefined} userCollegeId
 * @returns {boolean}
 */
export function isReportOwner(item, currentUser, userCollegeId) {
  if (!item) return false;
  if (currentUser?.uid && item.user_id && item.user_id === currentUser.uid) {
    return true;
  }
  if (userCollegeId && item.collegeid) {
    return item.collegeid.trim().toUpperCase() === userCollegeId.trim().toUpperCase();
  }
  return false;
}

/**
 * Extracts the Supabase Storage filename from a public image URL.
 * @param {string|null|undefined} imageUrl
 * @returns {string|null}
 */
export function extractStorageFileName(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  try {
    const marker = '/object/public/images/';
    const idx = imageUrl.indexOf(marker);
    if (idx !== -1) {
      return decodeURIComponent(imageUrl.slice(idx + marker.length));
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Filters campus reports by search query, type, category, and location.
 * @param {Array} reports
 * @param {object} filters
 * @returns {Array}
 */
export function filterReports(reports, {
  searchQuery = '',
  filterType = 'all',
  filterCategory = 'all',
  filterLocation = 'all'
} = {}) {
  if (!Array.isArray(reports)) return [];
  const q = searchQuery.trim().toLowerCase();

  return reports.filter((item) => {
    const isResolved = isReportResolved(item);
    const reportType = item.reportType || item.status || 'Lost';

    if (filterType === 'lost' && (reportType !== 'Lost' || isResolved)) return false;
    if (filterType === 'found' && (reportType !== 'Found' || isResolved)) return false;
    if (filterType === 'resolved' && !isResolved) return false;

    if (filterCategory !== 'all' && item.category !== filterCategory) return false;

    if (filterLocation !== 'all') {
      const loc = (item.location || '').toLowerCase();
      if (!loc.includes(filterLocation.toLowerCase())) return false;
    }

    if (q) {
      const haystack = [
        item.title,
        item.description,
        item.location,
        item.category,
        item.collegeid
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

/**
 * Computes summary statistics for a list of reports.
 * @param {Array} reports
 * @returns {{ total: number, lostActive: number, foundActive: number, resolved: number }}
 */
export function getReportStats(reports) {
  if (!Array.isArray(reports)) {
    return { total: 0, lostActive: 0, foundActive: 0, resolved: 0 };
  }
  let lostActive = 0;
  let foundActive = 0;
  let resolved = 0;

  for (const r of reports) {
    if (isReportResolved(r)) {
      resolved += 1;
    } else if ((r.reportType || r.status) === 'Found') {
      foundActive += 1;
    } else {
      lostActive += 1;
    }
  }

  return {
    total: reports.length,
    lostActive,
    foundActive,
    resolved
  };
}
