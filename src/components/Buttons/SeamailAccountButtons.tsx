import React from 'react';
import {SegmentedButtons} from 'react-native-paper';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {UserAccessLevel} from '../../libraries/Enums/UserAccessLevel';
import {AppIcons} from '../../libraries/Enums/Icons';

export const SeamailAccountButtons = () => {
  const {profilePublicData, isLoading, accessLevel} = useUserData();
  const [forUser, setForUser] = React.useState('');

  // console.log(profilePublicData);
  console.log('Access level', accessLevel);
  // useEffect(() => {
  //   if (!isLoading && profilePublicData.header.username) {
  //     setForUser(profilePublicData.header.username);
  //   }
  // }, [isLoading, profilePublicData]);

  let buttons = [];

  // Moderator
  if (UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.moderator)) {
    buttons.push({
      value: 'moderator',
      label: 'Moderator',
      icon: AppIcons.moderator,
    });
  }

  // TwitarrTeam
  if (UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.twitarrteam)) {
    buttons.push({
      value: 'twitarrteam',
      label: 'TwitarrTeam',
      icon: AppIcons.twitarteam,
    });
  }

  // All Privileged Users
  if (buttons.length !== 0) {
    buttons.unshift({
      value: profilePublicData.header.username,
      label: profilePublicData.header.displayName || profilePublicData.header.username,
      icon: AppIcons.user,
    });
  }

  if (buttons.length > 0) {
    return (
      <SegmentedButtons
        value={forUser}
        onValueChange={setForUser}
        buttons={buttons}
      />
    );
  }

  return <></>;
};
