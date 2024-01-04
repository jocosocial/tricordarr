import React from 'react';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {useDailyThemeQuery} from '../../../Queries/Alert/DailyThemeQueries';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {RefreshControl} from 'react-native';
import {DailyThemeCard} from '../../../Cards/MainScreen/DailyThemeCard';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {useCruise} from '../../../Context/Contexts/CruiseContext';
import {Text} from 'react-native-paper';

export const DailyThemeSettingsScreen = () => {
  const {data, refetch, isLoading, isRefetching} = useDailyThemeQuery();
  const {cruiseDayIndex} = useCruise();

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        <PaddedContentView>
          <Text>Today is day #{cruiseDayIndex}</Text>
        </PaddedContentView>
        {data?.map(dt => {
          return (
            <PaddedContentView key={dt.cruiseDay}>
              <DailyThemeCard dailyTheme={dt} cardTitle={`Theme for day #${dt.cruiseDay}:`} />
            </PaddedContentView>
          )
        })}
      </ScrollingContentView>
    </AppView>
  );
};
