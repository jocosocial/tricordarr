module.exports = {
  root: true,
  // https://stackoverflow.com/questions/58065765/eslint-jest-globals-environment-key-unknown
  extends: ['@react-native', 'plugin:jest/recommended', 'plugin:import/recommended', 'plugin:prettier/recommended'],
  plugins: ['unused-imports'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        paths: ['./tsconfig.json'],
      },
    },
  },
  rules: {
    'object-curly-spacing': ['error', 'never'],
    'linebreak-style': 0,
    'no-restricted-imports': [
      'error',
      {
        patterns: ['./*', '../*'],
      },
    ],
    // Maximum line length
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    // JSX formatting rules - let prettier handle these
    'react/jsx-indent': 'off',
    'react/jsx-indent-props': 'off',
    'react/jsx-closing-bracket-location': 'off',
    'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
    'react/jsx-max-props-per-line': ['error', {maximum: 1, when: 'multiline'}],
    // Unused imports - auto-fixable
    '@typescript-eslint/no-unused-vars': 'off', // Disable base rule to avoid conflicts
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    // React prop validation
    'react/jsx-no-undef': 'error',
    'react/no-typos': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['sibling', 'parent'], 'index', 'unknown'],
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: '#src/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '#assets/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '#specs/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true, // Let import/order handle this
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],
    // Disable import/no-duplicates because some packages (like react-native-gesture-handler)
    // require separate side-effect imports that cannot be consolidated
    'import/no-duplicates': 'off',
    // Disable import resolution errors for React Native internal modules
    'import/namespace': 'off',
    'import/default': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
  },
};
