import {StyleSheet, useColorScheme} from "react-native";
import {Colors} from "react-native/Libraries/NewAppScreen";

export const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export const isDarkMode = useColorScheme() === 'dark';

export const backgroundStyle = {
  backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
};