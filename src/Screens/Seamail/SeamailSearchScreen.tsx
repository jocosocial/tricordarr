import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {SeamailSearchBar} from '#src/Components/Search/SeamailSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {NotImplementedView} from '#src/Components/Views/Static/NotImplementedView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<ChatStackParamList, ChatStackScreenComponents.seamailSearchScreen>;

export const SeamailSearchScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.seamailSearchHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.seamail} urlPath={'/seamail'}>
        <SeamailSearchScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const SeamailSearchScreenInner = ({navigation, route}: Props) => {
  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.seamailSearchHelpScreen)}
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

  if (route.params.forUser) {
    const text = `Seamail search is available for user accounts, not for privileged accounts like ${route.params.forUser}.`;
    return <NotImplementedView additionalText={text} />;
  }
  return (
    <AppView>
      <SeamailSearchBar />
    </AppView>
  );
};
