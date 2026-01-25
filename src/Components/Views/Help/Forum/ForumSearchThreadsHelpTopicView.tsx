import React from 'react';

import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

interface ForumSearchThreadsHelpTopicViewProps {
  category?: boolean;
}

export const ForumSearchThreadsHelpTopicView = ({category = false}: ForumSearchThreadsHelpTopicViewProps) => {
  return (
    <HelpTopicView title={'Search Threads'} icon={AppIcons.search}>
      {category
        ? 'Search for forum threads within this category. This looks at the title only.'
        : 'Search for forum threads across all categories. This looks at the title only.'}
    </HelpTopicView>
  );
};
