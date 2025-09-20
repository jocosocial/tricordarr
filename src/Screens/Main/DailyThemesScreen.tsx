import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {useDailyThemeQuery} from '../../Queries/Alert/DailyThemeQueries.ts';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {RefreshControl} from 'react-native';
import {DailyThemeCard} from '../../Cards/MainScreen/DailyThemeCard.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';
import {useAuth} from '../../Context/Contexts/AuthContext.ts';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView.tsx';
import {ListTitleView} from '../../Views/ListTitleView.tsx';

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
