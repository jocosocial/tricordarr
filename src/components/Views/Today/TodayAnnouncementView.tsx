import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useAnnouncementsQuery} from '../../Queries/Alert/AnnouncementQueries.ts';
import {AnnouncementData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {AnnouncementCard} from '../../Cards/MainScreen/AnnouncementCard.tsx';
import {PaddedContentView} from '../Content/PaddedContentView.tsx';

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
