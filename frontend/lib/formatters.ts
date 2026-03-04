// Shared formatters used throughout the app

/**
 * Format a number as a Nepali Rupee price string.
 * e.g. 1500 → "Rs. 1,500"
 */
export function formatPrice(amount: number): string {
    return `Rs. ${amount.toLocaleString('en-NP')}`;
}

/**
 * Relative time (e.g. "2 days ago")
 */
export function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWk = Math.floor(diffDay / 7);
    const diffMo = Math.floor(diffDay / 30);

    if (diffMo > 0) return `${diffMo} month${diffMo > 1 ? 's' : ''} ago`;
    if (diffWk > 0) return `${diffWk} week${diffWk > 1 ? 's' : ''} ago`;
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
}

/**
 * Truncate a string to maxLen characters with ellipsis.
 */
export function truncate(str: string, maxLen = 120): string {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen).trimEnd() + '…';
}

/**
 * Capitalize first letter of each word.
 */
export function titleCase(str: string): string {
    return str
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Format a date string to a readable format.
 * e.g. "2024-01-15T10:30:00Z" → "Jan 15, 2024, 10:30 AM"
 */
export function formatDate(dateString: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-NP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
