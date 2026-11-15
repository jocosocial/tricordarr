import React from 'react';
import {Avatar} from 'react-native-paper';

import {ListItem} from '#src/Components/Lists/ListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

interface FezParticipantAddItemProps {
  onPress?: () => void;
  title?: string;
}

export const FezParticipantAddItem = ({onPress, title = 'Add participant'}: FezParticipantAddItemProps) => {
  const {styleDefaults, commonStyles} = useStyles();

  const getAvatar = React.useCallback(
    () => <Avatar.Icon icon={AppIcons.new} size={styleDefaults.avatarSize} />,
    [styleDefaults.avatarSize],
  );

  return <ListItem style={commonStyles.paddingHorizontalSmall} title={title} onPress={onPress} left={getAvatar} />;
};
