import React from 'react';

import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';

export const ForumPostSelfScreen = () => {
  return <ForumPostScreenBase refreshOnUserNotification={true} queryParams={{byself: true}} />;
};
