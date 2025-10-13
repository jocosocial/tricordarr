// This only seems to run when assembleRelease/bundleRelease is called
module.exports = api => {
  const babelEnv = api.env();
  const plugins = [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '#src': './src',
          '#assets': './assets',
        },
      },
    ],
    // This has to be the last one
    'react-native-reanimated/plugin',
  ];
  if (babelEnv !== 'development') {
    plugins.push(['transform-remove-console', {exclude: ['error', 'warn']}]);
  }
  // React Native Reanimated plugin must be the last plugin
  // plugins.push('react-native-reanimated/plugin');
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: plugins,
  };
};
