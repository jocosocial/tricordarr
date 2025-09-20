import React from 'react';
import {StyleSheet} from 'react-native';
import {Chip} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {PerformerHeaderData} from '#src/Structs/ControllerStructs';

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
