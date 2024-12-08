import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {ListTitleView} from '../../Views/ListTitleView.tsx';
import {HelpParagraphText} from '../../Text/Help/HelpParagraphText.tsx';

export const PhotostreamHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListTitleView title={'General'} />
        <PaddedContentView padTop={true}>
          <HelpParagraphText>
            Its a stream. Of photos. A photostream. Share what you're seeing on the ship.
          </HelpParagraphText>
        </PaddedContentView>
        <ListTitleView title={'Restrictions'} />
        <PaddedContentView padTop={true}>
          <HelpParagraphText>You can only post one image every five minutes. Choose wisely!</HelpParagraphText>
          <HelpParagraphText>Posted images cannot be deleted other than by moderators.</HelpParagraphText>
          <HelpParagraphText>
            Images cannot contain text. Any text detected in the image will be automatically blurred prior to upload.
            You will be able to review your image before posting it.
          </HelpParagraphText>
          <HelpParagraphText>
            You must tag either a location or event for your photo. This is to help others see what's going on.
          </HelpParagraphText>
          <HelpParagraphText>
            There are intentionally no comments or reactions. Just a stream of cool things happening on board.
          </HelpParagraphText>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
