import React from 'react';
import {Menu} from 'react-native-paper';

import {useForumComposer} from '#src/Context/Contexts/ForumComposerContext';
import {AppIcons} from '#src/Enums/Icons';
import {PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsReplyItemProps {
  forumPost: PostData;
  closeMenu: () => void;
}

/**
 * Starts a reply to a post by @mentioning its author in the thread composer.
 *
 * Swiftarr has no structural reply relation for forum posts; the @mention is what
 * generates the author's notification (`NotificationType.forumMention`).
 *
 * Renders nothing when there is no composer on screen. The parent menu also hides it for the
 * post's own author, since Swiftarr drops self-mentions.
 */
export const ForumPostActionsReplyItem = ({forumPost, closeMenu}: ForumPostActionsReplyItemProps) => {
  const composer = useForumComposer();

  if (!composer) {
    return null;
  }

  const onPress = () => {
    closeMenu();
    composer.mentionUser(forumPost.author.username);
  };
  return <Menu.Item dense={false} leadingIcon={AppIcons.reply} title={'Reply'} onPress={onPress} />;
};
