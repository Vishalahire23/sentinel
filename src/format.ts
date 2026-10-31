export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours.toString().padStart(2, '0');

    return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
  } catch {
    return isoString;
  }
}

export function formatChartDate(dateStr: string): string {
  if (!dateStr) return '';
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Format MM/DD like "10/02" -> "02 Oct"
  if (/^\d{1,2}\/\d{1,2}$/.test(dateStr)) {
    const [month, day] = dateStr.split('/');
    const mIdx = parseInt(month, 10) - 1;
    const dNum = parseInt(day, 10);
    if (mIdx >= 0 && mIdx < 12) {
      return `${dNum < 10 ? '0' : ''}${dNum} ${monthNames[mIdx]}`;
    }
  }

  // Format ISO or standard date
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const dNum = parsed.getDate();
    return `${dNum < 10 ? '0' : ''}${dNum} ${monthNames[parsed.getMonth()]}`;
  }

  return dateStr;
}

export function formatChartDateFull(dateStr: string): string {
  if (!dateStr) return '';
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Format MM/DD like "10/02" -> "02 Oct 2026"
  if (/^\d{1,2}\/\d{1,2}$/.test(dateStr)) {
    const [month, day] = dateStr.split('/');
    const mIdx = parseInt(month, 10) - 1;
    const dNum = parseInt(day, 10);
    if (mIdx >= 0 && mIdx < 12) {
      return `${dNum < 10 ? '0' : ''}${dNum} ${monthNames[mIdx]} 2026`;
    }
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const dNum = parsed.getDate().toString().padStart(2, '0');
    return `${dNum} ${monthNames[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }

  return dateStr;
}

export function formatDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function exportMonitorsToCsv(monitors: {
  name: string;
  domain: string;
  category: string;
  currentPrice: number;
  baselinePrice?: number;
  lowestPrice30d?: number;
  highestPrice30d?: number;
  currency: string;
  changePercent: number;
  state?: string;
  city?: string;
  stockStatus: string;
}[]): void {
  const headers = ['Product Name', 'Target Domain', 'Category', 'Current Price', 'Currency', 'Baseline Price', '30d Low (ATL)', '30d High', 'Delta %', 'State', 'City', 'Stock Status'];
  const rows = monitors.map(m => [
    `"${m.name.replace(/"/g, '""')}"`,
    `"${m.domain}"`,
    `"${m.category}"`,
    m.currentPrice,
    m.currency,
    m.baselinePrice || (m.currentPrice * 1.04).toFixed(2),
    m.lowestPrice30d || m.currentPrice,
    m.highestPrice30d || m.currentPrice,
    `${m.changePercent}%`,
    `"${m.state || ''}"`,
    `"${m.city || ''}"`,
    `"${m.stockStatus}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `sentinel_market_intelligence_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
