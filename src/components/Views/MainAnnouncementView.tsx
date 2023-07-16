import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useAnnouncementsQuery} from '../Queries/Alert/AnnouncementQueries';
import {AnnouncementData} from '../../libraries/Structs/ControllerStructs';
import {AnnouncementCard} from '../Cards/MainScreen/AnnouncementCard';

/**
 * A card to display an announcement from the API.
 */
export const MainAnnouncementView = () => {
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
        <AnnouncementCard key={a.id} announcement={a} />
      ))}
    </View>
  );
};
