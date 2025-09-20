import React, {PropsWithChildren} from 'react';
import {TouchableOpacity} from 'react-native';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface MessageAvatarContainerViewProps {
  onPress?: () => void;
}

export const MessageAvatarContainerView = ({children, onPress}: PropsWithChildren<MessageAvatarContainerViewProps>) => {
  const {commonStyles} = useStyles();
  const style = [commonStyles.marginRightSmall, commonStyles.flexColumn, commonStyles.flexEnd];
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      {children}
    </TouchableOpacity>
  );
};
