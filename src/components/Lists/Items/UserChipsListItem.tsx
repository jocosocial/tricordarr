import {List} from 'react-native-paper';
import React from 'react';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs.tsx';
import {View, StyleSheet, TextStyle, ViewStyle} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {UserChip} from '../../Chips/UserChip.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {AppIcon} from '../../Icons/AppIcon.tsx';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';

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
      style={itemStyle}
      description={userChips}
      left={() => getIcon()}
    />
  );
};
