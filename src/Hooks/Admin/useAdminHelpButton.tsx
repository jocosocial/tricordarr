import {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppIcons} from '#src/Enums/Icons';
import {
  CommonStackComponents,
  CommonStackParamList,
  HelpScreenComponents,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';

/**
 * Installs a Help header button that opens a help screen. Defaults to Server Admin help.
 * Optional `params` are passed through to the help screen (for example `{mode: 'admin'}`).
 */
export const useAdminHelpButton = <T extends HelpScreenComponents>(
  helpScreen: T = CommonStackComponents.adminHelpScreen as T,
  params?: CommonStackParamList[T],
) => {
  const navigation = useCommonStack();
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const getNavButtons = useCallback(
    () => (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() =>
              (navigation.push as (name: HelpScreenComponents, p?: CommonStackParamList[T]) => void)(
                helpScreen,
                paramsRef.current,
              )
            }
          />
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
