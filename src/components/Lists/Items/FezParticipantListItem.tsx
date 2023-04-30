import React from 'react';
import {IconButton, List} from 'react-native-paper';
import {UserAvatarImage} from '../../Images/UserAvatarImage';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useSeamailStack} from '../../Navigation/Stacks/SeamailStack';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {View} from 'react-native';
import {FezData, UserHeader} from '../../../libraries/Structs/ControllerStructs';

interface FezParticipantListItemProps {
  user: UserHeader;
  fez: FezData;
  onRemove: () => void;
}

export const FezParticipantListItem = ({user, fez, onRemove}: FezParticipantListItemProps) => {
  const {commonStyles} = useStyles();
  const navigation = useSeamailStack();
  let enableDelete = true;

  if (fez.owner.userID === user.userID || (fez.members && fez.members.participants.length <= 2)) {
    enableDelete = false;
  }

  const getAvatar = () => (
    <View style={[commonStyles.justifyCenter]}>
      <UserAvatarImage userID={user.userID} />
    </View>
  );

  const onPress = () => {
    navigation.push(SeamailStackScreenComponents.userProfileScreen, {
      userID: user.userID,
      username: user.username,
    });
  };

  const removeButton = () => {
    return <IconButton mode={'outlined'} size={20} icon={AppIcons.delete} onPress={onRemove} />;
  };

  // This has to account for some Paper bullshit where there is a secret View added when you define
  // a Right, and it has things that we can't override.
  const style = [commonStyles.paddingSides, enableDelete ? {paddingVertical: 2} : undefined];

  return (
    <List.Item
      style={style}
      title={user.username}
      onPress={onPress}
      left={getAvatar}
      right={enableDelete ? removeButton : undefined}
    />
  );
};
