import React from 'react';
import {Menu} from 'react-native-paper';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsModerateItemProps {
  closeMenu: () => void;
  forumPost: PostData;
}

export const ForumPostActionsModerateItem = ({forumPost, closeMenu}: ForumPostActionsModerateItemProps) => {
  const {hasModerator} = usePrivilege();
  const navigation = useCommonStack();

  if (!hasModerator) {
    return null;
  }

  return (
    <Menu.Item
      title={'Moderate'}
      dense={false}
      leadingIcon={AppIcons.moderator}
      onPress={() => {
        closeMenu();
        pushModerateResource(navigation, 'forumpost', forumPost.postID.toString());
      }}
    />
  );
};
