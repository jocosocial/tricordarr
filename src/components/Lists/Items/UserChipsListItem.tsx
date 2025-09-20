import {List} from 'react-native-paper';
import React from 'react';
import {UserHeader} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {View, StyleSheet, TextStyle, ViewStyle} from 'react-native';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {UserChip} from '#src/Components/Chips/UserChip.tsx';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {AppIcon} from '#src/Components/Icons/AppIcon.tsx';
import {CommonStackComponents, useCommonStack} from '#src/Components/Navigation/CommonScreens.tsx';

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
