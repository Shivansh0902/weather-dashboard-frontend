// src/lib/utils.js
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    timeZone: 'UTC'      // ← ensure we stay in UTC, not local TZ
  });
}