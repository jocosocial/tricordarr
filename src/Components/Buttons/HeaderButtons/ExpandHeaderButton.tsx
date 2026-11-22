import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';

interface ExpandHeaderButtonProps {
  expanded: boolean;
  onPress: () => void;
}

/**
 * Header toggle for Day Planner style timelines, switching between fitting every lane on screen and fixed-width
 * lanes that scroll sideways.
 */
export const ExpandHeaderButton = ({expanded, onPress}: ExpandHeaderButtonProps) => {
  const {theme} = useAppTheme();
  return (
    <Item
      title={'Expand'}
      color={expanded ? theme.colors.twitarrNeutralButton : undefined}
      iconName={AppIcons.expandHorizontal}
      onPress={onPress}
      testID={'headerExpand-headerButton'}
    />
  );
};
