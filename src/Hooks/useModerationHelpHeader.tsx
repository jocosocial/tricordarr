import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {
  ModeratorShareActionsMenu,
  ModeratorShareActionsMenuProps,
} from '#src/Components/Menus/Moderation/ModeratorShareActionsMenu';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

/**
 * Puts Help (and optional Share) in the current common-stack header for moderator screens.
 */
export const useModerationHelpHeader = (share?: ModeratorShareActionsMenuProps) => {
  const navigation = useCommonStack();
  const moderateType = share?.moderateType;
  const moderateID = share?.moderateID;
  const contentType = share?.contentType;
  const contentID = share?.contentID;
  const contentIcon = share?.contentIcon;

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          {moderateType !== undefined && moderateID !== undefined && (
            <ModeratorShareActionsMenu
              moderateType={moderateType}
              moderateID={moderateID}
              contentType={contentType}
              contentID={contentID}
              contentIcon={contentIcon}
            />
          )}
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.moderatorHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [contentIcon, contentID, contentType, moderateID, moderateType, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);
};
