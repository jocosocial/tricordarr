import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useDailyThemeQuery} from '../../Queries/Alert/DailyThemeQueries';
import {LoadingView} from '../../Views/Static/LoadingView';
import {RefreshControl} from 'react-native';
import {DailyThemeCard} from '../../Cards/MainScreen/DailyThemeCard';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {ListTitleView} from '../../Views/ListTitleView';

export const DailyThemesScreen = () => {
  const {data, refetch, isLoading, isRefetching} = useDailyThemeQuery();
  const {cruiseDayIndex} = useCruise();
  const {isLoggedIn} = useAuth();

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        <PaddedContentView padSides={false}>
          <ListTitleView title={`Today is day #${cruiseDayIndex}`} />
        </PaddedContentView>
        {data?.map(dt => {
          return (
            <PaddedContentView key={dt.cruiseDay}>
              <DailyThemeCard dailyTheme={dt} cardTitle={`Theme for day #${dt.cruiseDay}:`} />
            </PaddedContentView>
          );
        })}
      </ScrollingContentView>
    </AppView>
  );
};
