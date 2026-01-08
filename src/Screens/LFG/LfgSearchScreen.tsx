import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {LFGSearchBar} from '#src/Components/Search/LFGSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {LfgStackComponents, LfgStackParamList} from '#src/Navigation/Stacks/LFGStackNavigator';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<LfgStackParamList, LfgStackComponents.lfgSearchScreen>;

export const LfgSearchScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.lfgHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={'/lfg'}>
        <LfgSearchScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const LfgSearchScreenInner = ({navigation, route}: Props) => {
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
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.lfgHelpScreen)}
          />
        </MaterialHeaderButtons>
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
