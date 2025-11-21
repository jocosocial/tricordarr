import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const DisabledView = () => {
  const {serverUrl} = useSwiftarrQueryClient();
  const commonNavigation = useCommonStack();

  /**
   * Help for Disabled Features isn't really necessary, but it's here to secretly
   * override the headerRight and clear out any bad state that may linger when the
   * feature transiations from enabled to disabled.
   *
   * For example, if you already had the SeamailListScreen mounted but not active
   * (you went there and then went to another tab) the nav buttons wouldnt reaload
   * when the FeatureProvider updated and turned it off.
   */
  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => commonNavigation.push(CommonStackComponents.disabledHelpScreen)}
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
        <PaddedContentView>
          <Text>The server admins have temporarily disabled this section of Twitarr. It should be back up Soon™!</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text
            onPress={() =>
              commonNavigation.push(CommonStackComponents.siteUIScreen, {timestamp: new Date().toISOString()})
            }>
            You could also check {serverUrl} to see if there is more information available.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            If the feature works in the website but not in the app, it's likely that a critical bug in the app was
            discovered. The server admins may have disabled the feature for the app as a precaution.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
