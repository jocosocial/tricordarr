import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {DailyThemeCard} from '#src/Components/Cards/MainScreen/DailyThemeCard';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useDailyThemeQuery} from '#src/Queries/Alert/DailyThemeQueries';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.dailyThemesScreen>;

export const DailyThemesScreen = ({navigation}: Props) => {
  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.cruiseHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <LoggedInScreen>
      <PreRegistrationScreen>
        <DailyThemesScreenInner />
      </PreRegistrationScreen>
    </LoggedInScreen>
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
        refreshControl={<AppRefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
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
