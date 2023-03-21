import React from 'react';
import {SegmentedButtons} from 'react-native-paper';
import {useUserData} from '../Context/Contexts/UserDataContext';

export const SeamailAccountButtons = () => {
  const {profilePublicData} = useUserData();
  const [forUser, setForUser] = React.useState(profilePublicData.header.username);

  return (
    <SegmentedButtons
      value={forUser}
      onValueChange={setForUser}
      buttons={[
        {
          value: profilePublicData.header.username,
          label: profilePublicData.header.displayName || profilePublicData.header.username,
        },
        {
          value: 'moderator',
          label: 'Moderator',
        },
        {
          value: 'twitarrteam',
          label: 'TwitarrTeam',
        },
      ]}
    />
  );
};
