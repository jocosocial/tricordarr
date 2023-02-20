import {StyleSheet} from 'react-native';

// https://snack.expo.dev/@react-native-paper/react-native-paper-example_v5?platform=web
// https://callstack.github.io/react-native-paper/

export const screenStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  button: {
    margin: 4,
  },
  flexReverse: {
    flexDirection: 'row-reverse',
  },
  md3FontStyles: {
    lineHeight: 32,
  },
  fontStyles: {
    fontWeight: '800',
    fontSize: 24,
  },
});
