import * as React from 'react';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation';
import {BaseFABGroup} from './BaseFABGroup';
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

interface ForumFABProps {
  categoryId?: string;
  enableNewButton?: boolean;
  openLabel?: string;
  icon?: IconSource;
}

export const ForumFAB = ({categoryId, enableNewButton = false, openLabel = 'Forums', icon}: ForumFABProps) => {
  const navigation = useForumStackNavigation();

  // I'm worried this is gonna cause hook count consistency errors.
  // Testing will have to tell.
  let actions = [];
  if (enableNewButton && categoryId) {
    actions.push(
      FabGroupAction({
        icon: AppIcons.new,
        label: 'New Forum',
        onPress: () =>
          navigation.push(ForumStackComponents.forumThreadCreateScreen, {
            categoryId: categoryId,
          }),
      }),
    );
  }
  actions = actions.concat([
    FabGroupAction({
      icon: AppIcons.postSearch,
      label: 'Search Posts',
      onPress: () => navigation.push(ForumStackComponents.forumPostSearchScreen),
    }),
    FabGroupAction({
      icon: AppIcons.search,
      label: 'Search Forums',
      onPress: () => navigation.push(ForumStackComponents.forumThreadSearchScreen),
    }),
  ]);

  return <BaseFABGroup actions={actions} openLabel={openLabel} icon={icon || AppIcons.forum} />;
};
