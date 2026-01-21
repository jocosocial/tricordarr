import React from 'react';
import {StyleSheet, View} from 'react-native';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {ListItem} from '#src/Components/Lists/ListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface MinorActionListItemProps {
  title: string;
  icon: string;
  onPress: () => void;
  description?: string;
  active?: boolean;
}

export const MinorActionListItem = ({title, icon, onPress, description, active}: MinorActionListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  const styles = StyleSheet.create({
    title: {
      ...(active ? commonStyles.bold : undefined),
    },
    description: {
      ...(active ? commonStyles.bold : undefined),
    },
  });

  const getIcon = () => (
    <View style={commonStyles.paddingLeftSmall}>
      <AppIcon icon={icon} color={active ? theme.colors.twitarrNeutralButton : undefined} />
    </View>
  );

  return (
    <ListItem
      title={title}
      left={getIcon}
      onPress={onPress}
      description={description}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
    />
  );
};
