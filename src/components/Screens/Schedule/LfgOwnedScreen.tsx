import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';
import {RefreshControl, View} from 'react-native';
import {Text} from 'react-native-paper';
import {ScheduleEventCard} from '../../Cards/Schedule/ScheduleEventCard';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ScheduleItem} from '../../../libraries/Types';
import {lfgToItem} from '../../../libraries/DateTime';
import {PaddedContentView} from "../../Views/Content/PaddedContentView";

export const LfgOwnedScreen = () => {
  const {data, isFetched, isFetching, refetch} = useLfgListQuery({endpoint: 'owner'});
  const {commonStyles} = useStyles();

  let itemList: ScheduleItem[] = [];
  data?.pages.map(page => {
    page.fezzes.map(lfg => {
      const item = lfgToItem(lfg);
      if (item) {
        itemList.push(item);
      }
    });
  });

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <PaddedContentView>
          {isFetched && itemList.length === 0 && (
            <View key={'noResults'} style={[commonStyles.paddingVerticalSmall]}>
              <Text>No Results</Text>
            </View>
          )}
          {itemList.map((item, i) => (
            <View key={i} style={[commonStyles.paddingVerticalSmall]}>
              <ScheduleEventCard item={item} includeDay={true} />
            </View>
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
