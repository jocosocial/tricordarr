import React, {PropsWithChildren, useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppDrawer} from '#src/Components/Drawers/AppDrawer';
import {DrawerContext} from '#src/Context/Contexts/DrawerContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

export const DrawerProvider = ({children}: PropsWithChildren) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const {commonStyles} = useStyles();

  /**
   * In the switch from NativeStack to Stack, the header buttons were rendering
   * at the edges of the screen. This adds appropriate padding when the DrawerProvider
   * is providing buttons. Which is generally at the root of the stacks.
   */
  const styles = StyleSheet.create({
    container: {
      paddingLeft: 12,
      ...commonStyles.marginRightBig,
    },
  });

  /**
   * Reminder to future self: this is what provides the hamburger menu at the root of the stacks.
   */
  const getLeftMainHeaderButtons = useCallback(() => {
    return (
      <View style={styles.container}>
        <MaterialHeaderButtons left>
          <Item title={'Drawer'} iconName={AppIcons.drawer} onPress={() => setDrawerOpen(prevOpen => !prevOpen)} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [setDrawerOpen, styles]);

  return (
    <DrawerContext.Provider value={{drawerOpen, setDrawerOpen, getLeftMainHeaderButtons}}>
      <AppDrawer>{children}</AppDrawer>
    </DrawerContext.Provider>
  );
};
