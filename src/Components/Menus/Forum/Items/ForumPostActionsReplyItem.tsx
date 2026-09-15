import React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsReplyItemProps {
  forumPost: PostData;
  closeMenu: () => void;
  /**
   * Appends the mention to the thread composer. Supplied by the menu rather than read
   * from context here, because this item remounts inside Portal.Host.
   */
  onReply: (username: string) => void;
}

/**
 * Starts a reply to a post by @mentioning its author in the thread composer.
 *
 * Swiftarr has no structural reply relation for forum posts; the @mention is what
 * generates the author's notification (`NotificationType.forumMention`).
 */
export const ForumPostActionsReplyItem = ({forumPost, closeMenu, onReply}: ForumPostActionsReplyItemProps) => {
  const onPress = () => {
    closeMenu();
    onReply(forumPost.author.username);
  };
  return <Menu.Item dense={false} leadingIcon={AppIcons.reply} title={'Reply'} onPress={onPress} />;
};
