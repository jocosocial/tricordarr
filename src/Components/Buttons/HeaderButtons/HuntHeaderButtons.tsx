import React from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {HuntActionsMenu} from '#src/Components/Menus/Hunts/HuntActionsMenu';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Libraries/Sharing';

interface HuntHeaderButtonsProps {
  onHelp: () => void;
  onHuntPress?: () => void;
  shareContentType?: ShareContentType.hunt | ShareContentType.puzzle;
  shareContentID?: string;
}

/**
 * Shared hunt-screen header actions. Three-dots (share/help) is rightmost when sharing
 * a hunt or puzzle; otherwise Help is rightmost. Hunt (parent) sits to the left.
 */
export const HuntHeaderButtons = ({onHelp, onHuntPress, shareContentType, shareContentID}: HuntHeaderButtonsProps) => {
  const showShareMenu = shareContentType !== undefined && shareContentID !== undefined;

  return (
    <View>
      <MaterialHeaderButtons>
        {onHuntPress && (
          <Item title={'Hunt'} iconName={AppIcons.hunts} onPress={onHuntPress} testID={'headerHunt-headerButton'} />
        )}
        {showShareMenu ? (
          <HuntActionsMenu contentType={shareContentType} contentID={shareContentID} />
        ) : (
          <Item title={'Help'} iconName={AppIcons.help} onPress={onHelp} testID={'headerHelp-headerButton'} />
        )}
      </MaterialHeaderButtons>
    </View>
  );
};
