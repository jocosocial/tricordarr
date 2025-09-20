import {PerformerHeaderData} from '../../Libraries/Structs/ControllerStructs.tsx';
import {useStyles} from '../Context/Contexts/StyleContext.ts';
import {Chip} from 'react-native-paper';
import React from 'react';
import {StyleSheet} from 'react-native';
import {AvatarImage} from '../Images/AvatarImage.tsx';
import {AppIcon} from '../Icons/AppIcon.tsx';
import {AppIcons} from '../../Libraries/Enums/Icons.ts';

interface PerformerChipProps {
  performerHeader: PerformerHeaderData;
  onPress?: () => void;
  disabled?: boolean;
}

export const PerformerChip = (props: PerformerChipProps) => {
  const {commonStyles, styleDefaults} = useStyles();
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
      {props.performerHeader.isOfficialPerformer && (
        <>
          <AppIcon size={styleDefaults.IconSizeSmall} icon={AppIcons.official} />
          &nbsp;
        </>
      )}
      {props.performerHeader.name}
    </Chip>
  );
};
