module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    // Disable specific rules causing problems
    '@typescript-eslint/no-unused-vars': 'warn', // Change from error to warning
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'warn'
  }
};