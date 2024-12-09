import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ChatStackParamList} from '../../Navigation/Stacks/ChatStackNavigator.tsx';
import {ChatStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {NotImplementedView} from '../../Views/Static/NotImplementedView';
import {View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';

type SeamailSearchScreenProps = NativeStackScreenProps<
  ChatStackParamList,
  ChatStackScreenComponents.seamailSearchScreen
>;

export const SeamailSearchScreen = ({navigation, route}: SeamailSearchScreenProps) => {
  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.seamailHelpScreen)}
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

  if (route.params.forUser) {
    const text = `Seamail search is available for user accounts, not for privileged accounts like ${route.params.forUser}.`;
    return <NotImplementedView additionalText={text} />;
  }
  return (
    <AppView>
      <PaddedContentView padSides={false} padTop={true}>
        <SeamailSearchBar />
      </PaddedContentView>
    </AppView>
  );
};
