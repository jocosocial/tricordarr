import {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {List} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface PreRegistrationListItemProps {
  title: string;
  iconName?: string;
  onPress: () => void;
}

export const PreRegistrationListItem = (props: PreRegistrationListItemProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    title: {
      ...commonStyles.bold,
    },
    item: {
      // backgroundColor: 'pink',
      ...commonStyles.paddingVerticalZero,
    },
  });
  const getIcon = useCallback(() => {
    if (props.iconName) {
      return <AppIcon icon={props.iconName} />;
    }
    return undefined;
  }, [props.iconName]);

  return (
    <List.Item
      style={styles.item}
      title={props.title}
      titleStyle={styles.title}
      left={getIcon}
      onPress={props.onPress}
    />
  );
};
