import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const PhotostreamHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>Its a stream. Of photos. A photostream. Share what you're seeing on the ship.</HelpTopicView>
        <HelpTopicView>
          There are intentionally no comments or reactions. Just a stream of cool things happening on board.
        </HelpTopicView>
        <HelpChapterTitleView title={'Restrictions'} />
        <HelpTopicView title={'Rate Limit'}>
          You can only post one image every five minutes. Choose wisely!
        </HelpTopicView>
        <HelpTopicView title={'No Deletion'}>Posted images cannot be deleted other than by moderators.</HelpTopicView>
        <HelpTopicView title={'No Text'}>
          Images cannot contain text. Any text detected in the image will be automatically blurred prior to upload. You
          will be able to review your image before posting it.
        </HelpTopicView>
        <HelpTopicView title={'Tagging'}>
          You must tag either a location or event for your photo. This is to help others see what's going on.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
