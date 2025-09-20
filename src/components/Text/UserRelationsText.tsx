import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AppIcons} from '#src/Enums/Icons';
import {Text} from 'react-native-paper';
import React from 'react';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const ModeratorBlockText = () => {
  const {commonStyles, styleDefaults} = useStyles();
  return (
    <Text style={[commonStyles.marginBottomSmall]}>
      <AppIcon icon={AppIcons.moderator} size={styleDefaults.fontSize} />
      &nbsp; You're a Moderator. You'll still see their content. Blocking does hide your non-Mod alt accounts from this
      person, and vice-versa.
    </Text>
  );
};

export const UserBlockText = () => {
  const {commonStyles} = useStyles();
  return (
    <Text style={[commonStyles.marginBottomSmall]}>
      Blocking a user will hide all that user's content from you, and also hide all your content from them.
    </Text>
  );
};

export const ModeratorMuteText = () => {
  const {commonStyles, styleDefaults} = useStyles();
  return (
    <Text style={[commonStyles.marginBottomSmall]}>
      <AppIcon icon={AppIcons.moderator} size={styleDefaults.fontSize} />
      &nbsp; You're a Moderator. You'll still see their content.
    </Text>
  );
};

export const UserMuteText = () => {
  const {commonStyles} = useStyles();
  return (
    <Text style={[commonStyles.marginBottomSmall]}>Muting a user will hide all that user's content from you.</Text>
  );
};

export const UserFavoriteText = () => {
  const {commonStyles} = useStyles();
  return (
    <Text style={[commonStyles.marginBottomSmall]}>
      Favoriting a user allows them to call you (between iOS devices only).
    </Text>
  );
};

export const UserDirectoryText = () => {
  const {commonStyles} = useStyles();
  return (
    <Text style={[commonStyles.marginBottomSmall]}>
      Enter partial username above to find a user, then tap on a match to view their profile.
    </Text>
  );
};
