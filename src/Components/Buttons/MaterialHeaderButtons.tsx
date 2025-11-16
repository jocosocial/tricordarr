import {Platform, StyleSheet} from 'react-native';
import {HeaderButtons, HeaderButtonsProps} from 'react-navigation-header-buttons';

import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';

/**
 * Wrapper around HeaderButtons that applies reduced spacing between buttons.
 * The default spacing in react-navigation-header-buttons is 24px on iOS.
 */
export const MaterialHeaderButtons = (props: Omit<HeaderButtonsProps, 'HeaderButtonComponent'>) => {
  const styles = StyleSheet.create({
    headerButtons: {
      // I don't love what iOS does with the title in the middle of the header.
      // Hoping this isn't too visually gross. 12 needed for iPhone SE. 16 standard.
      columnGap: Platform.select({ios: 12, default: 16}),
      ...props.style,
    },
  });

  return <HeaderButtons {...props} HeaderButtonComponent={MaterialHeaderButton} style={styles.headerButtons} />;
};
