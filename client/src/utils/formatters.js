/**
 * Format a price value for display.
 * Returns "FREE" badge text when price === 0.
 */
export const formatPrice = (price) => {
  if (price === 0 || price === '0') return 'FREE';
  return `₹${Number(price).toLocaleString('en-IN')}`;
};

/**
 * Format a MongoDB createdAt date to a human-readable relative time.
 */
export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Capitalize first letter.
 */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/**
 * Condition badge color mapping.
 */
export const conditionColor = {
  New:       'bg-green-100 text-green-700',
  'Like New': 'bg-emerald-100 text-emerald-700',
  Good:      'bg-blue-100 text-blue-700',
  Fair:      'bg-amber-100 text-amber-700',
  Used:      'bg-gray-100 text-gray-600',
};

/**
 * Listing status badge color mapping.
 */
export const statusColor = {
  available: 'bg-green-100 text-green-700',
  reserved:  'bg-amber-100 text-amber-700',
  sold:      'bg-gray-100 text-gray-500',
};
