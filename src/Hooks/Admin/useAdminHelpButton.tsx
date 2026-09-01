import {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppIcons} from '#src/Enums/Icons';
import {
  CommonStackComponents,
  HelpScreenComponents,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';

/**
 * Installs a Help header button that opens a help screen. Defaults to Server Admin help.
 */
export const useAdminHelpButton = (helpScreen: HelpScreenComponents = CommonStackComponents.adminHelpScreen) => {
  const navigation = useCommonStack();

  const getNavButtons = useCallback(
    () => (
      <View>
        <MaterialHeaderButtons>
          <Item title={'Help'} iconName={AppIcons.help} onPress={() => navigation.push(helpScreen)} />
        </MaterialHeaderButtons>
      </View>
    ),
    [helpScreen, navigation],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);
};
