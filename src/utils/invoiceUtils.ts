export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const isAfterEventDate = (endDateTime: string): boolean => {
  const eventEnd = new Date(endDateTime);
  const now = new Date();
  return now > eventEnd;
};

export const calculateDepositAmount = (total: number, percentage: number = 50): number => {
  return Math.round((total * percentage / 100) * 100) / 100;
};

export const calculateBalance = (total: number, depositPercentage: number = 50): number => {
  const deposit = calculateDepositAmount(total, depositPercentage);
  return total - deposit;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};