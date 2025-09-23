import React from 'react';
import {StyleProp, StyleSheet, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {MD3TypescaleKey} from 'react-native-paper/lib/typescript/types';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {useAppTheme} from '#src/Styles/Theme';

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

export const getUserBylineString = (
  user: UserHeader,
  includePronoun: boolean,
  includeDisplayName: boolean,
  prefix?: string,
) => {
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
  return `${prefix ? `${prefix} ` : ''}${displayComponents.join(' ')}`;
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
      color: byPrivilegedUser ? theme.colors.twitarrNegativeButton : theme.colors.onBackground,
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
