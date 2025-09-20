import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import {AnnouncementCard} from '#src/Components/Cards/MainScreen/AnnouncementCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useAnnouncementsQuery} from '#src/Queries/Alert/AnnouncementQueries';
import {AnnouncementData} from '#src/Structs/ControllerStructs';

/**
 * A card to display an announcement from the API.
 */
export const TodayAnnouncementView = () => {
  const {data} = useAnnouncementsQuery();
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);

  useEffect(() => {
    if (data) {
      setAnnouncements(data);
    }
  }, [data]);

  return (
    <View>
      {announcements.map(a => (
        <PaddedContentView key={a.id}>
          <AnnouncementCard announcement={a} />
        </PaddedContentView>
      ))}
    </View>
  );
};
