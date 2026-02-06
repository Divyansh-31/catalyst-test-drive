/**
 * Formats a number as Indian Rupees (INR) currency
 * Uses Indian numbering system (lakhs, crores)
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};
