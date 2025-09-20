import React from 'react';

import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';

export const ForumPostFavoriteScreen = () => {
  return <ForumPostScreenBase refreshOnUserNotification={true} queryParams={{bookmarked: true}} />;
};
