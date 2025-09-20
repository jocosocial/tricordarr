import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {HelpChapterTitleView} from '../../Views/Help/HelpChapterTitleView.tsx';
import {HelpTopicView} from '../../Views/Help/HelpTopicView.tsx';

export const PhotostreamHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>Its a stream. Of photos. A photostream. Share what you're seeing on the ship.</HelpTopicView>
        <HelpChapterTitleView title={'Restrictions'} />
        <HelpTopicView>You can only post one image every five minutes. Choose wisely!</HelpTopicView>
        <HelpTopicView>Posted images cannot be deleted other than by moderators.</HelpTopicView>
        <HelpTopicView>
          Images cannot contain text. Any text detected in the image will be automatically blurred prior to upload. You
          will be able to review your image before posting it.
        </HelpTopicView>
        <HelpTopicView>
          You must tag either a location or event for your photo. This is to help others see what's going on.
        </HelpTopicView>
        <HelpTopicView>
          There are intentionally no comments or reactions. Just a stream of cool things happening on board.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
