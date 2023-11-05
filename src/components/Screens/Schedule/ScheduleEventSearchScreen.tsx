import React, {useState} from 'react';
import {AppView} from '../../Views/AppView';
import {EventSearchBar} from '../../Search/EventSearchBar';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {RefreshControl} from 'react-native';

export const ScheduleEventSearchScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} enabled={false} />}>
        <PaddedContentView>
          <EventSearchBar setIsLoading={setRefreshing} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
