import React from 'react';
import {Chip} from 'react-native-paper';
import {StyleProp, ViewStyle} from 'react-native';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface KeywordChipProps {
  onPress?: () => void;
  onClose?: () => void;
  keyword: string;
  style?: StyleProp<ViewStyle>;
}
export const KeywordChip = ({keyword, onPress, onClose, style}: KeywordChipProps) => {
  const {commonStyles} = useStyles();
  const defaultChipStyle = {
    ...commonStyles.marginBottomSmall,
    ...commonStyles.marginRightSmall,
  };
  return (
    <Chip onPress={onPress} onClose={onClose} style={[defaultChipStyle, style]}>
      {keyword}
    </Chip>
  );
};
