import React, {useCallback, useRef} from 'react';
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

interface AdminHeaderButtonsProps {
  onHelp: () => void;
}

/**
 * Shared admin-screen header actions. Help is rightmost.
 */
export const AdminHeaderButtons = ({onHelp}: AdminHeaderButtonsProps) => {
  return (
    <View>
      <MaterialHeaderButtons>
        <Item title={'Help'} iconName={AppIcons.help} onPress={onHelp} />
      </MaterialHeaderButtons>
    </View>
  );
};

/**
 * Returns a `getNavButtons` callback that renders Help in the header.
 * Defaults to Server Admin help. Optional `params` are passed through to the
 * help screen (for example `{mode: 'admin'}`).
 */
export const useAdminHeaderButtons = <T extends HelpScreenComponents>(
  helpScreen: T = CommonStackComponents.adminHelpScreen as T,
  params?: CommonStackParamList[T],
) => {
  const navigation = useCommonStack();
  const paramsRef = useRef(params);
  paramsRef.current = params;

  return useCallback(
    () => (
      <AdminHeaderButtons
        onHelp={() =>
          (navigation.push as (name: HelpScreenComponents, p?: CommonStackParamList[T]) => void)(
            helpScreen,
            paramsRef.current,
          )
        }
      />
    ),
    [helpScreen, navigation],
  );
};
