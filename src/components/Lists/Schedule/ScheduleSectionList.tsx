import React, {useCallback, useEffect, useState} from 'react';
import {SectionList, View} from 'react-native';
import {ScheduleItem} from '../../../libraries/Types';
import {TimeDivider} from '../Dividers/TimeDivider';
import {ScheduleEventCard} from '../../Cards/Schedule/ScheduleEventCard';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {getTimeMarker} from '../../../libraries/DateTime';

interface SectionData {
  title: string;
  data: ScheduleItem[];
}

export const ScheduleSectionList = ({items}: {items: ScheduleItem[]}) => {
  const [listData, setListData] = useState<SectionData[]>([]);
  const {commonStyles} = useStyles();

  const buildListData = useCallback((scheduleItems: ScheduleItem[]) => {
    let sectionData: SectionData[] = [];
    scheduleItems.map((scheduleItem, i) => {
      // For the first element, just shove a new section into the list.
      if (i === 0) {
        const section: SectionData = {
          title: getTimeMarker(scheduleItem.startTime, scheduleItem.timeZone),
          data: [scheduleItem],
        };
        sectionData.push(section);
      }
    });
    return sectionData;
  }, []);

  const renderListHeader = () => {
    if (!items || !listData) {
      return <TimeDivider label={'No events today'} />;
    }
    return <></>;
  };

  const renderListFooter = () => <TimeDivider label={'End of Schedule'} />;

  const renderListItem = ({item}: {item: ScheduleItem}) => {
    return (
      <View>
        <ScheduleEventCard item={item} />
      </View>
    );
  };

  const renderListSectionHeader = ({section: {title}}: {section: {title: string}}) => {
    return <TimeDivider label={title} />;
  };

  useEffect(() => {
    setListData(buildListData(items));
  }, [items, buildListData]);

  return (
    <SectionList
      style={{
        ...commonStyles.paddingHorizontal,
      }}
      sections={listData}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={renderListFooter}
      renderItem={renderListItem}
      renderSectionHeader={renderListSectionHeader}
    />
  );
};
