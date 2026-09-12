import React, {useCallback} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {
  ModeratorShareActionsMenu,
  ModeratorShareActionsMenuProps,
} from '#src/Components/Menus/Moderation/ModeratorShareActionsMenu';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface ModerationHeaderButtonsProps {
  onHelp: () => void;
  share?: ModeratorShareActionsMenuProps;
}

/**
 * Shared moderator-screen header actions. Help is rightmost; optional Share
 * sits to the left when a moderate target is provided.
 */
export const ModerationHeaderButtons = ({onHelp, share}: ModerationHeaderButtonsProps) => {
  const moderateType = share?.moderateType;
  const moderateID = share?.moderateID;

  return (
    <View>
      <MaterialHeaderButtons>
        {moderateType !== undefined && moderateID !== undefined && (
          <ModeratorShareActionsMenu
            moderateType={moderateType}
            moderateID={moderateID}
            contentType={share?.contentType}
            contentID={share?.contentID}
            contentIcon={share?.contentIcon}
          />
        )}
        <Item title={'Help'} iconName={AppIcons.help} onPress={onHelp} />
      </MaterialHeaderButtons>
    </View>
  );
};

/**
 * Returns a `getNavButtons` callback that renders Help (and optional Share)
 * for moderator screens.
 */
export const useModerationHeaderButtons = (share?: ModeratorShareActionsMenuProps) => {
  const navigation = useCommonStack();
  const moderateType = share?.moderateType;
  const moderateID = share?.moderateID;
  const contentType = share?.contentType;
  const contentID = share?.contentID;
  const contentIcon = share?.contentIcon;

  return useCallback(
    () => (
      <ModerationHeaderButtons
        onHelp={() => navigation.push(CommonStackComponents.moderatorHelpScreen)}
        share={
          moderateType !== undefined && moderateID !== undefined
            ? {moderateType, moderateID, contentType, contentID, contentIcon}
            : undefined
        }
      />
    ),
    [contentIcon, contentID, contentType, moderateID, moderateType, navigation],
  );
};
