import React from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useDailyThemeQuery} from '#src/Queries/Alert/DailyThemeQueries';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {RefreshControl} from 'react-native';
import {DailyThemeCard} from '#src/Components/Cards/MainScreen/DailyThemeCard';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';

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
