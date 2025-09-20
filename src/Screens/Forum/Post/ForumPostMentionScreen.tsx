import React from 'react';
import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';

export const ForumPostMentionScreen = () => {
  return <ForumPostScreenBase refreshOnUserNotification={true} queryParams={{mentionself: true}} />;
};
