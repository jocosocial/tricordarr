import React from 'react';
import {IconButton} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {Linking} from 'react-native';

interface LinkIconButtonProps {
  icon: IconSource;
  link?: string;
}

export const LinkIconButton = (props: LinkIconButtonProps) => {
  if (!props.link) {
    return <></>;
  }

  return <IconButton icon={props.icon} onPress={() => Linking.openURL(props.link as string)} />;
};
