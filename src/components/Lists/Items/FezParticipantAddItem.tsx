import React from 'react';
import {List} from 'react-native-paper';
import {UserAvatarImage} from '../../Images/UserAvatarImage';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useSeamailStack} from '../../Navigation/Stacks/SeamailStack';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {AppIcons} from '../../../libraries/Enums/Icons';

interface FezParticipantAddItemProps {
  fez: FezData;
}

export const FezParticipantAddItem = ({fez}: FezParticipantAddItemProps) => {
  const getAvatar = () => <UserAvatarImage icon={AppIcons.new} />;
  const {commonStyles} = useStyles();
  const navigation = useSeamailStack();

  const onPress = () => {
    navigation.push(SeamailStackScreenComponents.seamailAddParticipantScreen, {fez: fez});
  };

  return <List.Item style={[commonStyles.paddingSides]} title={'Add participant'} onPress={onPress} left={getAvatar} />;
};
