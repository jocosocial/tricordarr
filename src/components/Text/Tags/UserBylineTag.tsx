import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import React from 'react';
import {Text} from 'react-native-paper';
import {StyleProp, TextStyle, StyleSheet} from 'react-native';
import {MD3TypescaleKey} from 'react-native-paper/lib/typescript/types';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {useAppTheme} from '../../../styles/Theme.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

interface UserBylineTagProps {
  user: UserHeader;
  includeDisplayName?: boolean;
  includePronoun?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<TextStyle>;
  selectable?: boolean;
  variant?: keyof typeof MD3TypescaleKey;
  prefix?: string;
}

export const getUserBylineString = (user: UserHeader, includePronoun: boolean, includeDisplayName: boolean) => {
  let displayComponents: string[] = [];
  if (includeDisplayName && user.displayName) {
    displayComponents.push(user.displayName);
    displayComponents.push(`(@${user.username})`);
  } else {
    displayComponents.push(`@${user.username}`);
  }
  if (includePronoun && user.preferredPronoun) {
    displayComponents.push(user.preferredPronoun);
  }
  return displayComponents.join(' ');
};

export const UserBylineTag = ({
  user,
  includePronoun = true,
  includeDisplayName = true,
  onPress,
  onLongPress,
  style,
  selectable = true,
  variant,
  prefix,
}: UserBylineTagProps) => {
  const {privilegedUsernames} = usePrivilege();
  const theme = useAppTheme();
  const {commonStyles} = useStyles();
  const byPrivilegedUser = privilegedUsernames.some(username => user.username === username);
  const styles = StyleSheet.create({
    innerText: style as TextStyle,
    user: {
      color: byPrivilegedUser ? theme.colors.twitarrNegativeButton : undefined,
      ...(byPrivilegedUser ? commonStyles.bold : undefined),
      ...(style as TextStyle),
    },
  });
  return (
    <Text style={styles.user} onPress={onPress} selectable={selectable} variant={variant} onLongPress={onLongPress}>
      {prefix && (
        <Text variant={variant} style={styles.innerText}>
          {prefix}{' '}
        </Text>
      )}
      {getUserBylineString(user, includePronoun, includeDisplayName)}
    </Text>
  );
};
