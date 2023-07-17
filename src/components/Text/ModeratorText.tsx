import {AppIcon} from '../Images/AppIcon';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Text} from 'react-native-paper';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';

export const ModeratorUserBlockText = () => {
  const {commonStyles, styleDefaults} = useStyles();
  return (
    <Text style={[commonStyles.marginBottomSmall]}>
      <AppIcon icon={AppIcons.moderator} size={styleDefaults.fontSize} />
      &nbsp; You're a Moderator. You'll still see their content. Blocking does hide your non-Mod alt accounts from this
      person, and vice-versa.
    </Text>
  );
};
