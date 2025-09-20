import React from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {useDailyThemeQuery} from '#src/Queries/Alert/DailyThemeQueries.ts';
import {LoadingView} from '#src/Views/Static/LoadingView.tsx';
import {RefreshControl} from 'react-native';
import {DailyThemeCard} from '#src/Cards/MainScreen/DailyThemeCard.tsx';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {useCruise} from '#src/Context/Contexts/CruiseContext.ts';
import {useAuth} from '#src/Context/Contexts/AuthContext.ts';
import {NotLoggedInView} from '#src/Views/Static/NotLoggedInView.tsx';
import {ListTitleView} from '#src/Views/ListTitleView.tsx';

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
