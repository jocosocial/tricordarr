import {StyleSheet} from 'react-native';
import {List} from 'react-native-paper';
import {type Props as RNPListItemProps} from 'react-native-paper/lib/typescript/components/List/ListItem';

import {useStyles} from '#src/Context/Contexts/StyleContext';

export const ListItem = ({
  title,
  description,
  onPress,
  left,
  right,
  style,
  contentStyle,
  titleStyle,
  descriptionStyle,
}: RNPListItemProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    item: {
      ...commonStyles.paddingRightSmall,
      ...style,
    },
    content: {
      ...commonStyles.paddingLeftSmall,
      ...contentStyle,
    },
  });

  return (
    <List.Item
      title={title}
      description={description}
      onPress={onPress}
      left={left}
      right={right}
      style={styles.item}
      contentStyle={styles.content}
      titleStyle={titleStyle}
      descriptionStyle={descriptionStyle}
    />
  );
};
