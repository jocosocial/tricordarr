import React, {PropsWithChildren, useCallback} from 'react';
import {DrawerContext} from '../Contexts/DrawerContext';
import {AppDrawer} from '../../Drawers/AppDrawer';
import {View} from 'react-native';
import {commonStyles} from '../../../styles';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {HomeHeaderMenu} from '../../Menus/HomeHeaderMenu';
import {AppIcons} from '../../../libraries/Enums/Icons';

export const DrawerProvider = ({children}: PropsWithChildren) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const getRightMainHeaderButtons = useCallback(() => {
    return (
      <View style={[commonStyles.flexRow]}>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <HomeHeaderMenu />
        </HeaderButtons>
      </View>
    );
  }, []);

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
    <DrawerContext.Provider value={{drawerOpen, setDrawerOpen, getLeftMainHeaderButtons, getRightMainHeaderButtons}}>
      <AppDrawer>{children}</AppDrawer>
    </DrawerContext.Provider>
  );
};
