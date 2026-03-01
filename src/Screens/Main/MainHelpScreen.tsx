import React from 'react';

import {HelpFABView} from '#src/Components/Buttons/FloatingActionButtons/HelpFABView';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const MainHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Drawer'} icon={AppIcons.drawer}>
            The drawer contains minor features of the app, documentation, and more. It can be accessed through a button
            in the top left of some screens.
          </HelpTopicView>
          <HelpTopicView title={'Context Menu'} icon={AppIcons.menu}>
            Most screens have a menu that gives you extra options. Look for in the upper right corner of the screen.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Floating Action Buttons'}>
          <HelpFABView icon={AppIcons.new} label={'Floating Action Button'} />
          <HelpTopicView>
            Some screens have a floating action button in the lower right corner. This is often used to create new
            objects or access other views.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Interaction'}>
          <HelpTopicView title={'Pull to Refresh'}>
            Most screens support pulling down from the top of the screen to refresh the data.
          </HelpTopicView>
          <HelpTopicView title={'Long Press'}>
            Most items in a list can be long-pressed to open a menu of additional context-specific actions.
          </HelpTopicView>
          <HelpTopicView title={'Swipe'}>
            Some list items can be swiped to the left or right to perform actions. The orientation of the swipe can be
            customized in the Appearance Settings.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
