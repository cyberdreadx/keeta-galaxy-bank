/**
 * Format large numbers with K/M/B suffixes for better readability
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with suffix
 */
export function formatLargeNumber(num: number, decimals: number = 2): string {
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  // Billions (1,000,000,000+)
  if (absNum >= 1_000_000_000) {
    return sign + (absNum / 1_000_000_000).toFixed(decimals) + 'B';
  }
  
  // Millions (1,000,000+)
  if (absNum >= 1_000_000) {
    return sign + (absNum / 1_000_000).toFixed(decimals) + 'M';
  }
  
  // Thousands (1,000+)
  if (absNum >= 1_000) {
    return sign + (absNum / 1_000).toFixed(decimals) + 'K';
  }
  
  // Less than 1,000 - show with decimals
  return sign + absNum.toFixed(decimals);
}

/**
 * Format balance with smart truncation
 * - Shows full decimals for small amounts (< 1,000)
 * - Shows K/M/B for large amounts
 */
export function formatBalance(balance: number): string {
  const absBalance = Math.abs(balance);
  
  // For amounts >= 1,000, use K/M/B suffixes
  if (absBalance >= 1_000) {
    return formatLargeNumber(balance, 2);
  }
  
  // For smaller amounts, show more precision
  if (absBalance >= 1) {
    return balance.toFixed(2);
  }
  
  // For very small amounts, show up to 6 decimals
  return balance.toFixed(6).replace(/\.?0+$/, '');
}

/**
 * Format token amount with appropriate precision based on size
 */
export function formatTokenAmount(amount: number, symbol?: string): string {
  const formatted = formatBalance(amount);
  return symbol ? `${formatted} ${symbol}` : formatted;
}

