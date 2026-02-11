/**
 * Currency Utilities
 * Handles currency conversion and formatting for international properties
 */

// Exchange rates relative to GBP (British Pound)
const EXCHANGE_RATES = {
    GBP: 1,
    EUR: 1.17,
    USD: 1.27,
    AED: 4.66,
    INR: 106.5,
    AUD: 1.94,
    CAD: 1.71,
    CHF: 1.11,
};

// Currency symbols
const CURRENCY_SYMBOLS = {
    GBP: '£',
    EUR: '€',
    USD: '$',
    AED: 'د.إ',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
};

// Currency names
const CURRENCY_NAMES = {
    GBP: 'British Pound',
    EUR: 'Euro',
    USD: 'US Dollar',
    AED: 'UAE Dirham',
    INR: 'Indian Rupee',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc',
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount || !fromCurrency || !toCurrency) return amount;

    const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
    const toRate = EXCHANGE_RATES[toCurrency] || 1;

    // Convert to GBP first, then to target currency
    const gbpAmount = amount / fromRate;
    const convertedAmount = gbpAmount * toRate;

    return convertedAmount;
};

/**
 * Format currency amount with symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code
 * @param {boolean} showCode - Whether to show currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'GBP', showCode = false) => {
    if (!amount && amount !== 0) return '';

    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formatted = new Intl.NumberFormat('en-GB', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

    if (showCode) {
        return `${symbol}${formatted} ${currency}`;
    }

    return `${symbol}${formatted}`;
};

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency) => {
    return CURRENCY_SYMBOLS[currency] || currency;
};

/**
 * Get currency name
 * @param {string} currency - Currency code
 * @returns {string} Currency name
 */
export const getCurrencyName = (currency) => {
    return CURRENCY_NAMES[currency] || currency;
};

/**
 * Get all supported currencies
 * @returns {Array} Array of currency objects
 */
export const getAllCurrencies = () => {
    return Object.keys(CURRENCY_SYMBOLS).map(code => ({
        code,
        symbol: CURRENCY_SYMBOLS[code],
        name: CURRENCY_NAMES[code],
        rate: EXCHANGE_RATES[code],
    }));
};

/**
 * Format price range with currency
 * @param {number} min - Minimum price
 * @param {number} max - Maximum price
 * @param {string} currency - Currency code
 * @returns {string} Formatted price range
 */
export const formatPriceRange = (min, max, currency = 'GBP') => {
    if (!min && !max) return '';
    if (!max) return `From ${formatCurrency(min, currency)}`;
    if (!min) return `Up to ${formatCurrency(max, currency)}`;
    return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
};
