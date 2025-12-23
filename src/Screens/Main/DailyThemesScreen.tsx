import React from 'react';
import {RefreshControl} from 'react-native';

import {DailyThemeCard} from '#src/Components/Cards/MainScreen/DailyThemeCard';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useDailyThemeQuery} from '#src/Queries/Alert/DailyThemeQueries';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

export const DailyThemesScreen = () => {
  return (
    <PreRegistrationScreen>
      <LoggedInScreen>
        <DailyThemesScreenInner />
      </LoggedInScreen>
    </PreRegistrationScreen>
  );
};

const DailyThemesScreenInner = () => {
  const {data, refetch, isLoading, isRefetching} = useDailyThemeQuery();
  const {cruiseDayIndex} = useCruise();

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
