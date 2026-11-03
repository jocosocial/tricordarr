import React from 'react';

import {HelpFABView} from '#src/Components/Buttons/FloatingActionButtons/HelpFABView';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {ReportButtonHelpTopicView} from '#src/Components/Views/Help/Common/ReportButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';
import {formatSecondsToHumanReadable} from '#src/Libraries/DateTime';
import {PHOTOSTREAM_MAX_CAPTURE_AGE_SECONDS} from '#src/Libraries/ImageCaptureDate';

export const PhotostreamHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>Its a stream. Of photos. A photostream. Share what you're seeing on the ship.</HelpTopicView>
          <HelpTopicView>
            There are intentionally no comments or reactions. Just a stream of cool things happening on board.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Restrictions'}>
          <HelpTopicView title={'Rate Limit'}>
            Typically you can only post one image every five minutes. This limit may be adjusted by the TwitarrTeam.
          </HelpTopicView>
          <HelpTopicView title={'Photo Age'}>
            Photos must have been taken within the last{' '}
            {formatSecondsToHumanReadable(PHOTOSTREAM_MAX_CAPTURE_AGE_SECONDS)}. This is checked using the date stored
            in the photo by the camera. Photos without a capture date (such as screenshots or edited images) cannot be
            posted.
          </HelpTopicView>
          <HelpTopicView title={'Image Source'}>
            You can take a photo with the camera button, or attach one from your photo library with the attach button.
            Photos from other camera apps or a paired camera work too, as long as they meet the age requirement.
          </HelpTopicView>
          <HelpTopicView title={'No Deletion'}>Posted images cannot be deleted other than by moderators.</HelpTopicView>
          <HelpTopicView title={'No Text'}>
            Images cannot contain text. Any text detected in the image will be automatically blurred prior to upload.
            You will be able to review your image before posting it.
          </HelpTopicView>
          <HelpTopicView title={'Tagging'}>
            You must tag either a location or event for your photo. This is to help others see what's going on.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Floating Action Button'}>
          <HelpFABView icon={AppIcons.new} label={'New Post'} />
          <HelpTopicView>
            Press the "New Post" button in the lower right to create a new photostream post. You'll be able to take or
            attach an image, tag it with a location or event, and review it before posting.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Filter'} icon={AppIcons.filter}>
            Filter photostream posts by location. A filter is active if the menu icon is blue. Long press the filter
            menu button to clear any active filters.
          </HelpTopicView>
          <HelpTopicView title={'Image Settings'} icon={AppIcons.settings}>
            Access image settings to configure how images are processed and displayed in the photostream.
          </HelpTopicView>
          <ReportButtonHelpTopicView />
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
