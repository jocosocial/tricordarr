import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ShutternautHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Roles'}>
          <HelpTopicView title={'Shutternaut'} icon={AppIcons.shutternaut}>
            With this role you can pick events that you intend to photograph. Contact a Shutternaut Manager to be
            assigned the Shutternaut role. Managers can assign the role to users through a link in the app drawer.
          </HelpTopicView>
          <HelpTopicView title={'Shutternaut Manager'} icon={AppIcons.shutternautManager}>
            This role allows you to mark events as needing to get photographed by someone. It can also assign the
            Shutternaut role to users. Contact the Twitarr Team or THO to be assigned the Shutternaut Manager role.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'How to Use'}>
          <HelpTopicView title={'Filters'} icon={AppIcons.filter}>
            In the Schedule screen you can filter events based on whether they need a photographer. You can also view
            what events you are photographing. Filters are mutually exclusive so you can only have one active
            Shutternaut filter at a time.
          </HelpTopicView>
          <HelpTopicView icon={AppIcons.shutternaut}>
            Long-press an event or open the event details screen to mark yourself as a photographer for the event.
          </HelpTopicView>
          <HelpTopicView icon={AppIcons.needsPhotographer}>
            Events with this icon have been marked as needing a photographer by a Shutternaut Manager.
          </HelpTopicView>
          <HelpTopicView>
            All Shutternaut roles will see a list of photographers for an event in the event details screen.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Shared Calendar'}>
          <HelpTopicView>
            All Shutternauts can see a shared calendar of events that they are photographing and events that need a
            photographer. It can be accessed from the app drawer.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Forums'}>
          <HelpTopicView>
            There is a dedicated forum category for Shutternauts that will be in the category list. You can use this for
            semi-private discussion with other Shutternauts. TwitarrTeam and THO can also view that category.
          </HelpTopicView>
          <HelpTopicView>
            You can post up to eight (8) images in a single forum post. There is a file size limit of 20MB per photo.
          </HelpTopicView>
          <HelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
