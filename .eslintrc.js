module.exports = {
  root: true,
  // https://stackoverflow.com/questions/58065765/eslint-jest-globals-environment-key-unknown
  extends: ['@react-native', 'plugin:jest/recommended', 'plugin:import/recommended'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        paths: ['./tsconfig.json'],
      },
    },
  },
  rules: {
    'linebreak-style': 0,
    'no-restricted-imports': [
      'error',
      {
        patterns: ['./*', '../*'],
      },
    ],
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
