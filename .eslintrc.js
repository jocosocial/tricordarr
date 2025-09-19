module.exports = {
  root: true,
  // https://stackoverflow.com/questions/58065765/eslint-jest-globals-environment-key-unknown
  extends: ['@react-native', 'plugin:jest/recommended'],
  rules: {
    'linebreak-style': 0,
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../src/*', './src/*', '../../src/*', '../../../src/*', '../../../../src/*'],
            message: 'Use @tricordarr alias instead of relative imports to src directory. Replace with @tricordarr/...',
          },
        ],
      },
    ],
  },
};
