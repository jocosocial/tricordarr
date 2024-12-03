import React from 'react';
import {IconButton} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {Linking} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

interface LinkIconButtonProps {
  icon: IconSource;
  link?: string;
}

export const LinkIconButton = (props: LinkIconButtonProps) => {
  if (!props.link) {
    return <></>;
  }

  return (
    <IconButton
      icon={props.icon}
      onPress={() => Linking.openURL(props.link as string)}
      onLongPress={() => Clipboard.setString(props.link as string)}
    />
  );
};
