import React from 'react';
import {Linking} from 'react-native';
import {IconButton} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {useClipboard} from '#src/Hooks/useClipboard';

interface LinkIconButtonProps {
  icon: IconSource;
  link?: string;
}

export const LinkIconButton = (props: LinkIconButtonProps) => {
  const {setString} = useClipboard();

  if (!props.link) {
    return <></>;
  }

  return (
    <IconButton
      icon={props.icon}
      onPress={() => Linking.openURL(props.link as string)}
      onLongPress={() => setString(props.link as string)}
    />
  );
};
