export const toDisplayCase = (str: string): string => {
  return str
    .split('-')
    .map((word, index) => {
      // Special case for 'b2b' to keep it lowercase
      if (word === 'b2b' && index === 0) return 'B2B';
      // Capitalize first letter of each word except the first word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

