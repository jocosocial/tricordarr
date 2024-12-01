import {PerformerHeaderData} from '../../libraries/Structs/ControllerStructs.tsx';
import {useStyles} from '../Context/Contexts/StyleContext.ts';
import {UserAvatarImage} from '../Images/UserAvatarImage.tsx';
import {Chip} from 'react-native-paper';
import React from 'react';
import {StyleSheet} from 'react-native';
import {AvatarImage} from '../Images/AvatarImage.tsx';

interface PerformerChipProps {
  performerHeader: PerformerHeaderData;
  onPress?: () => void;
  disabled?: boolean;
}

export const PerformerChip = (props: PerformerChipProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    chip: {
      ...commonStyles.marginRightSmall,
      ...commonStyles.marginBottomSmall,
    },
  });

  const getAvatar = () => {
    if (props.performerHeader.photo) {
      return <AvatarImage imageName={props.performerHeader.photo} />;
    }
  };

  return (
    <Chip style={styles.chip} icon={getAvatar} disabled={props.disabled} onPress={props.onPress}>
      {props.performerHeader.name}
    </Chip>
  );
};
