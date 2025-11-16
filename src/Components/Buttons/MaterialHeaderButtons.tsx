import {StyleSheet} from 'react-native';
import {HeaderButtons, HeaderButtonsProps} from 'react-navigation-header-buttons';

import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';

/**
 * Wrapper around HeaderButtons that applies reduced spacing between buttons.
 * The default spacing in react-navigation-header-buttons is 24px on iOS.
 */
export const MaterialHeaderButtons = (props: Omit<HeaderButtonsProps, 'HeaderButtonComponent'>) => {
  const styles = StyleSheet.create({
    headerButtons: {
      columnGap: 16,
      ...props.style,
    },
  });

  return <HeaderButtons {...props} HeaderButtonComponent={MaterialHeaderButton} style={styles.headerButtons} />;
};
