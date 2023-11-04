import React from 'react';
import {AppView} from '../../Views/AppView';
import {EventSearchBar} from '../../Search/EventSearchBar';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';

export const ScheduleEventSearchScreen = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <EventSearchBar />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
