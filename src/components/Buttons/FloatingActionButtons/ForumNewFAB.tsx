import * as React from 'react';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation';
import {BaseFABGroup} from './BaseFABGroup';
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

interface ForumFABProps {
  categoryId: string;
  openLabel?: string;
  icon?: IconSource;
}

export const ForumNewFAB = ({categoryId, openLabel = 'Forum', icon}: ForumFABProps) => {
  const navigation = useForumStackNavigation();

  const actions = [
    FabGroupAction({
      icon: AppIcons.new,
      label: 'New Forum',
      onPress: () =>
        navigation.push(ForumStackComponents.forumThreadCreateScreen, {
          categoryId: categoryId,
        }),
    }),
  ];

  return <BaseFABGroup actions={actions} openLabel={openLabel} icon={icon || AppIcons.new} />;
};
