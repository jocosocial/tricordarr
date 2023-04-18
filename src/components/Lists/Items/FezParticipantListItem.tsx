import React from 'react';
import {List} from 'react-native-paper';
import {UserHeaderProps} from '../../../libraries/Types';
import {UserAvatarImage} from '../../Images/UserAvatarImage';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useSeamailStack} from '../../Navigation/Stacks/SeamailStack';

export const FezParticipantListItem = ({user}: UserHeaderProps) => {
  const getAvatar = () => <UserAvatarImage userID={user.userID} />;
  const {commonStyles} = useStyles();
  const navigation = useSeamailStack();

  const onPress = () => {
    navigation.push(SeamailStackScreenComponents.userProfileScreen, {
      userID: user.userID,
      username: user.username,
    });
  };

  return <List.Item style={[commonStyles.paddingSides]} title={user.username} onPress={onPress} left={getAvatar} />;
};
