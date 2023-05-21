import React from 'react';
import {List} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useSeamailStack} from '../../Navigation/Stacks/SeamailStack';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Avatar} from 'react-native-paper';

interface FezParticipantAddItemProps {
  fez: FezData;
}

export const FezParticipantAddItem = ({fez}: FezParticipantAddItemProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const navigation = useSeamailStack();

  const getAvatar = () => <Avatar.Icon icon={AppIcons.new} size={styleDefaults.avatarSize} />;

  const onPress = () => {
    navigation.push(SeamailStackScreenComponents.seamailAddParticipantScreen, {fez: fez});
  };

  return <List.Item style={[commonStyles.paddingSides]} title={'Add participant'} onPress={onPress} left={getAvatar} />;
};
