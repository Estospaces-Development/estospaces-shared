/**
 * Typography Utilities
 * Consistent typography system matching modern chat interface standards
 */

export const typography = {
  // Font sizes with line-height and letter-spacing
  sizes: {
    xs: 'text-xs',      // 12px - captions, labels
    sm: 'text-sm',      // 14px - body text, buttons, inputs
    base: 'text-base',  // 14px - default body
    lg: 'text-lg',      // 16px - subheadings
    xl: 'text-xl',      // 18px - section headings
    '2xl': 'text-2xl',  // 20px - page headings
    '3xl': 'text-3xl',  // 24px - hero headings
  },
  
  // Font weights
  weights: {
    light: 'font-light',      // 300
    normal: 'font-normal',    // 400
    medium: 'font-medium',    // 500
    semibold: 'font-semibold', // 600
    bold: 'font-bold',        // 700
  },
  
  // Predefined typography combinations
  h1: 'text-2xl font-semibold', // 20px, 600 weight
  h2: 'text-xl font-semibold',  // 18px, 600 weight
  h3: 'text-lg font-semibold',  // 16px, 600 weight
  h4: 'text-base font-semibold', // 14px, 600 weight
  body: 'text-sm',              // 14px, 400 weight
  caption: 'text-xs',           // 12px, 400 weight
  button: 'text-sm font-medium', // 14px, 500 weight
  label: 'text-sm font-medium',  // 14px, 500 weight
  input: 'text-base',           // 14px, 400 weight
};

// Helper function to combine typography classes
export const getTypographyClass = (variant = 'body', className = '') => {
  const baseClass = typography[variant] || typography.body;
  return `${baseClass} ${className}`.trim();
};

export default typography;

