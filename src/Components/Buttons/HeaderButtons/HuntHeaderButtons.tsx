import React from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppIcons} from '#src/Enums/Icons';

interface HuntHeaderButtonsProps {
  onHelp: () => void;
  onHuntPress?: () => void;
}

/**
 * Shared hunt-screen header actions. Help is rightmost; Hunt (parent) sits to its left.
 */
export const HuntHeaderButtons = ({onHelp, onHuntPress}: HuntHeaderButtonsProps) => {
  return (
    <View>
      <MaterialHeaderButtons>
        {onHuntPress && (
          <Item title={'Hunt'} iconName={AppIcons.hunts} onPress={onHuntPress} testID={'headerHunt-headerButton'} />
        )}
        <Item title={'Help'} iconName={AppIcons.help} onPress={onHelp} testID={'headerHelp-headerButton'} />
      </MaterialHeaderButtons>
    </View>
  );
};
