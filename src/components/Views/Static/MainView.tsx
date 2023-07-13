import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {commonStyles} from '../../../styles';
import {PaddedContentView} from '../Content/PaddedContentView';
import {List} from 'react-native-paper';
import {ListSection} from '../../Lists/ListSection';
import {useBottomTabNavigator} from '../../Navigation/Tabs/BottomTabNavigator';
import {BottomTabComponents, MainStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {MainNavigationListItem} from '../../Lists/Items/MainNavigationListItem';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';

export type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.mainScreen, NavigatorIDs.mainStack>;

export const MainView = ({navigation}: Props) => {
  const bottomNav = useBottomTabNavigator();
  const {getLeftMainHeaderButtons} = useDrawer();
  //
  // const getRightButtons = useCallback(() => {
  //   return (
  //     <View style={[commonStyles.flexRow]}>
  //       <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
  //         <HomeHeaderMenu />
  //       </HeaderButtons>
  //     </View>
  //   );
  // }, []);
  //
  // const getLeftButtons = useCallback(() => {
  //   return (
  //     <View style={[commonStyles.marginRightBig]}>
  //       <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
  //         <Item title="Drawer" iconName={AppIcons.drawer} onPress={() => setDrawerOpen(prevOpen => !prevOpen)} />
  //       </HeaderButtons>
  //     </View>
  //   );
  // }, [setDrawerOpen]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: getLeftMainHeaderButtons,
    });
  }, [getLeftMainHeaderButtons, navigation]);

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text variant={'displayMedium'}>Hello Boat!</Text>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>
            ⚠️ Warning ⚠️
          </Text>
          <Text>This app is an extremely experimental prototype and should be treated as such.</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
