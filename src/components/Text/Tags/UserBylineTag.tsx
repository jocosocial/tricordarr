import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import React from 'react';
import {Text} from 'react-native-paper';
import {StyleProp, TextStyle} from 'react-native';
import {MD3TypescaleKey} from 'react-native-paper/lib/typescript/types';

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
  let displayComponents: string[] = prefix ? [prefix] : [];
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
  return (
    <Text style={style} onPress={onPress} selectable={selectable} variant={variant} onLongPress={onLongPress}>
      {getUserBylineString(user, includePronoun, includeDisplayName, prefix)}
    </Text>
  );
};
