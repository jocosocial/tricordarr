import React from 'react';

import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

interface ForumSearchPostsHelpTopicViewProps {
  scope?: 'all' | 'thread' | 'category';
}

const getText = (scope: 'all' | 'thread' | 'category') => {
  switch (scope) {
    case 'thread':
      return 'Search for forum posts within this thread. This looks at the content of the posts.';
    case 'category':
      return 'Search for forum posts within this category. This looks at the content of the posts.';
    case 'all':
    default:
      return 'Search for forum posts across all categories. This looks at the content of the posts.';
  }
};

export const ForumSearchPostsHelpTopicView = ({scope = 'all'}: ForumSearchPostsHelpTopicViewProps) => {
  return (
    <HelpTopicView title={'Search Posts'} icon={AppIcons.postSearch}>
      {getText(scope)}
    </HelpTopicView>
  );
};
