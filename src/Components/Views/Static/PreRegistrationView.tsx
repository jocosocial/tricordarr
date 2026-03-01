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
import {CommonStackComponents, HelpScreenComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

// @ts-ignore
import preregistration from '#assets/preregistration.jpg';

interface PreRegistrationViewProps {
  helpScreen?: HelpScreenComponents;
}

export const PreRegistrationView = ({
  helpScreen = CommonStackComponents.preRegistrationHelpScreen,
}: PreRegistrationViewProps) => {
  const commonNavigation = useCommonStack();

  /**
   * You can pass a custom help screen to help the user maintain context.
   */
  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => {
              // blehhhhh
              (commonNavigation.push as (name: HelpScreenComponents) => void)(helpScreen);
            }}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [commonNavigation, helpScreen]);

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
        <PaddedContentView>
          <Text>
            In the mean time, you can view the help chapter for this feature by tapping the help icon in the top right
            of this screen. Or pack.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
