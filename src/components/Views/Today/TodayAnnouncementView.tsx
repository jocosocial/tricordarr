import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useAnnouncementsQuery} from '#src/Components/Queries/Alert/AnnouncementQueries.ts';
import {AnnouncementData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {AnnouncementCard} from '#src/Components/Cards/MainScreen/AnnouncementCard.tsx';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView.tsx';

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
