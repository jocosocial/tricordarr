import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppImage} from '#src/Components/Images/AppImage';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

// @ts-ignore
import preregistration from '#assets/preregistration.jpg';

export const PreRegistrationView = () => {
  const commonNavigation = useCommonStack();

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => commonNavigation.push(CommonStackComponents.preRegistrationHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [commonNavigation]);

  useEffect(() => {
    commonNavigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, commonNavigation]);

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          {/* <OobePreRegistrationCompleteCard /> */}
          <AppImage image={AppImageMetaData.fromAsset(preregistration, 'preregistration.jpg')} mode={'cardcover'} />
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            Parts of Twitarr aren't available until we're physically on the ship. You can come back to this app in
            pre-registration mode until the cruise starts.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
