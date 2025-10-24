import React, {ReactNode} from 'react';

import {ListItem} from '#src/Components/Lists/ListItem';
import {ContentText} from '#src/Components/Text/ContentText';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface ForumCategoryListItemBaseProps {
  title: string;
  description?: string;
  onPress?: () => void;
  right?: () => ReactNode;
}

export const ForumCategoryListItemBase = ({title, description, onPress, right}: ForumCategoryListItemBaseProps) => {
  const {commonStyles} = useStyles();

  const getDescription = () => description && <ContentText textVariant={'bodyMedium'} text={description} />;

  return (
    <ListItem
      title={title}
      titleStyle={commonStyles.bold}
      description={getDescription}
      onPress={onPress}
      right={right}
    />
  );
};
