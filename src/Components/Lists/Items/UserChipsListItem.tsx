import React from 'react';
import {StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {List} from 'react-native-paper';

import {UserChip} from '#src/Components/Chips/UserChip';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserChipsListItemProps {
  users?: UserHeader[];
  title?: string;
  titleStyle?: TextStyle;
  itemStyle?: ViewStyle;
  icon?: string;
  onPress?: () => void;
}

export const UserChipsListItem = ({
  titleStyle,
  itemStyle,
  users = [],
  title = 'Users',
  icon = AppIcons.group,
  onPress,
}: UserChipsListItemProps) => {
  const {commonStyles} = useStyles();
  const commonNavigation = useCommonStack();

  const styles = StyleSheet.create({
    title: {
      ...commonStyles.fontSizeLabel,
      ...titleStyle,
    },
    icon: {
      ...commonStyles.paddingTopSmall,
    },
    item: {
      ...commonStyles.paddingHorizontal,
      ...itemStyle,
    },
  });

  const getIcon = () => <AppIcon icon={icon} style={styles.icon} />;

  const userChips = () => (
    <View style={commonStyles.chipContainer}>
      {users.flatMap((user: UserHeader) => (
        <UserChip
          key={user.userID}
          userHeader={user}
          onPress={() =>
            commonNavigation.push(CommonStackComponents.userProfileScreen, {
              userID: user.userID,
            })
          }
        />
      ))}
    </View>
  );

  return (
    <List.Item
      onPress={onPress}
      title={title}
      titleStyle={styles.title}
      style={styles.item}
      description={userChips}
      left={() => getIcon()}
    />
  );
};
