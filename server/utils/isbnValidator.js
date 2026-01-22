/**
 * Validate ISBN-10 format and checksum
 * @param {string} isbn - ISBN-10 string
 * @returns {boolean} - Whether ISBN-10 is valid
 */
export const validateISBN10 = (isbn) => {
  // Remove hyphens and spaces
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  
  // Check if it's 10 characters
  if (cleanISBN.length !== 10) return false;
  
  // Check if first 9 are digits and last is digit or X
  if (!/^\d{9}[\dX]$/.test(cleanISBN)) return false;
  
  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanISBN[i]) * (10 - i);
  }
  
  // Add check digit (X = 10)
  const checkDigit = cleanISBN[9] === 'X' ? 10 : parseInt(cleanISBN[9]);
  sum += checkDigit;
  
  // Valid if divisible by 11
  return sum % 11 === 0;
};

/**
 * Validate ISBN-13 format and checksum
 * @param {string} isbn - ISBN-13 string
 * @returns {boolean} - Whether ISBN-13 is valid
 */
export const validateISBN13 = (isbn) => {
  // Remove hyphens and spaces
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  
  // Check if it's 13 digits
  if (cleanISBN.length !== 13 || !/^\d{13}$/.test(cleanISBN)) {
    return false;
  }
  
  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(cleanISBN[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  
  const checkDigit = parseInt(cleanISBN[12]);
  const calculatedCheck = (10 - (sum % 10)) % 10;
  
  return checkDigit === calculatedCheck;
};

/**
 * Validate ISBN (both ISBN-10 and ISBN-13)
 * @param {string} isbn - ISBN string
 * @returns {object} - Validation result with isValid flag and message
 */
export const validateISBN = (isbn) => {
  if (!isbn || typeof isbn !== 'string') {
    return { isValid: false, message: 'ISBN is required and must be a string' };
  }
  
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  
  if (cleanISBN.length === 10) {
    const isValid = validateISBN10(cleanISBN);
    return {
      isValid,
      message: isValid ? 'Valid ISBN-10' : 'Invalid ISBN-10 format or checksum',
      type: 'ISBN-10'
    };
  } else if (cleanISBN.length === 13) {
    const isValid = validateISBN13(cleanISBN);
    return {
      isValid,
      message: isValid ? 'Valid ISBN-13' : 'Invalid ISBN-13 format or checksum',
      type: 'ISBN-13'
    };
  } else {
    return {
      isValid: false,
      message: 'ISBN must be 10 or 13 characters (excluding hyphens/spaces)'
    };
  }
};

/**
 * Format ISBN with hyphens for display
 * @param {string} isbn - ISBN string
 * @returns {string} - Formatted ISBN
 */
export const formatISBN = (isbn) => {
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  
  if (cleanISBN.length === 10) {
    // Format ISBN-10: X-XXX-XXXXX-X
    return `${cleanISBN.slice(0, 1)}-${cleanISBN.slice(1, 4)}-${cleanISBN.slice(4, 9)}-${cleanISBN.slice(9)}`;
  } else if (cleanISBN.length === 13) {
    // Format ISBN-13: XXX-X-XXX-XXXXX-X
    return `${cleanISBN.slice(0, 3)}-${cleanISBN.slice(3, 4)}-${cleanISBN.slice(4, 7)}-${cleanISBN.slice(7, 12)}-${cleanISBN.slice(12)}`;
  }
  
  return isbn;
};
