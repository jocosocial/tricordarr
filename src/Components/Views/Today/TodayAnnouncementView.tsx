import React from 'react';
import {View} from 'react-native';

import {AnnouncementCard} from '#src/Components/Cards/MainScreen/AnnouncementCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useAnnouncementsQuery} from '#src/Queries/Alert/AnnouncementQueries';

/**
 * A card to display an announcement from the API.
 */
export const TodayAnnouncementView = () => {
  const {data} = useAnnouncementsQuery();

  if (!data) {
    return <></>;
  }

  return (
    <View>
      {data.map(a => (
        <PaddedContentView key={a.id}>
          <AnnouncementCard announcement={a} />
        </PaddedContentView>
      ))}
    </View>
  );
};
