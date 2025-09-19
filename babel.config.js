// This only seems to run when assembleRelease/bundleRelease is called
module.exports = api => {
  const babelEnv = api.env();
  const plugins = [
    [
      'react-native-reanimated/plugin',
      {
        relativeSourceLocation: true,
      },
    ],
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@tricordarr': './src',
        },
      },
    ],
  ];
  if (babelEnv !== 'development') {
    plugins.push(['transform-remove-console', {exclude: ['error', 'warn']}]);
  }
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: plugins,
  };
};
