export const formatCurrency = (amount, currency = 'USD') => {
  const symbol = getCurrencySymbol(currency);
  if (amount === null || amount === undefined) return `${symbol}0`;
  const num = Number(amount);
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(num);
  } catch (e) {
    return `${symbol}${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
};

export const formatCompactCurrency = (amount, currency = 'USD') => {
  if (!amount) return '$0';
  const num = Number(amount);
  const symbol = getCurrencySymbol(currency);

  if (num >= 1_000_000_000) {
    return `${symbol}${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${symbol}${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${symbol}${(num / 1_000).toFixed(1)}K`;
  }
  return `${symbol}${num.toFixed(0)}`;
};

export const getCurrencySymbol = (currency) => {
  switch (currency?.toUpperCase()) {
    case 'GBP': return '£';
    case 'EUR': return '€';
    case 'INR': return '₹';
    default: return '$';
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const getDepartmentStyle = (dept) => {
  switch (dept?.toLowerCase()) {
    case 'engineering':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'product':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'sales':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'finance':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'hr':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const getCountryFlag = (country) => {
  switch (country?.toUpperCase()) {
    case 'US': return '🇺🇸';
    case 'UK': return '🇬🇧';
    case 'GERMANY': return '🇩🇪';
    case 'INDIA': return '🇮🇳';
    default: return '🌐';
  }
};
