import React from 'react';
import {ForumPostScreenBase} from './ForumPostScreenBase';

export const ForumPostMentionScreen = () => {
  return <ForumPostScreenBase refreshOnUserNotification={true} queryParams={{mentionself: true}} />;
};
