import {AppView} from '../../Views/AppView.tsx';
import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LfgStackComponents, LfgStackParamList} from '../../Navigation/Stacks/LFGStackNavigator.tsx';
import {ListTitleView} from '../../Views/ListTitleView.tsx';
import {View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {LFGSearchBar} from '../../Search/LFGSearchBar.tsx';

type Props = NativeStackScreenProps<LfgStackParamList, LfgStackComponents.lfgSearchScreen>;

export const LfgSearchScreen = ({navigation, route}: Props) => {
  const getTitle = () => {
    if (route.params.endpoint) {
      const title = route.params.endpoint.charAt(0).toUpperCase() + route.params.endpoint.slice(1);
      return `Search ${title} LFGs`;
    }
    return 'Search LFGs';
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.lfgHelpScreen)}
          />
        </HeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <ListTitleView title={getTitle()} />
      <LFGSearchBar endpoint={route.params.endpoint} />
    </AppView>
  );
};
