import React, {PropsWithChildren, useCallback} from 'react';
import {View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {AppDrawer} from '#src/Components/Drawers/AppDrawer';
import {DrawerContext} from '#src/Context/Contexts/DrawerContext';
import {AppIcons} from '#src/Enums/Icons';
import {commonStyles} from '#src/Styles';

export const DrawerProvider = ({children}: PropsWithChildren) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const getLeftMainHeaderButtons = useCallback(() => {
    return (
      <View style={[commonStyles.marginRightBig]}>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          <Item title="Drawer" iconName={AppIcons.drawer} onPress={() => setDrawerOpen(prevOpen => !prevOpen)} />
        </HeaderButtons>
      </View>
    );
  }, [setDrawerOpen]);

  return (
    <DrawerContext.Provider value={{drawerOpen, setDrawerOpen, getLeftMainHeaderButtons}}>
      <AppDrawer>{children}</AppDrawer>
    </DrawerContext.Provider>
  );
};
