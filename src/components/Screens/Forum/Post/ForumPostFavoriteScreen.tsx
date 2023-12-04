import React from 'react';
import {ForumPostScreenBase} from './ForumPostScreenBase';

export const ForumPostFavoriteScreen = () => {
  return <ForumPostScreenBase refreshOnUserNotification={true} queryParams={{bookmarked: true}} />;
};
