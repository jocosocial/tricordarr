import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';
import {RefreshControl, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {LfgCard} from '../../Cards/Schedule/LfgCard';
import {FezType} from '../../../libraries/Enums/FezType';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {ScheduleLfgFilterMenu} from '../../Menus/ScheduleLfgFilterMenu';
import {LfgStackComponents} from '../../../libraries/Enums/Navigation';
import {useScheduleFilter} from '../../Context/Contexts/ScheduleFilterContext';
import {ScheduleLfgCruiseDayFilterMenu} from '../../Menus/ScheduleLfgCruiseDayFilterMenu';
import {ScheduleLfgListMenu} from '../../Menus/ScheduleLfgListMenu';
import {LfgFAB} from '../../Buttons/FloatingActionButtons/LfgFAB';
import {useIsFocused} from '@react-navigation/native';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useSocket} from '../../Context/Contexts/SocketContext';
import {useLFGStackNavigation} from '../../Navigation/Stacks/LFGStackNavigator';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {useAuth} from '../../Context/Contexts/AuthContext';

interface LfgJoinedScreenProps {
  endpoint: 'open' | 'joined' | 'owner';
}

export const LfgListScreen = ({endpoint}: LfgJoinedScreenProps) => {
  const {lfgTypeFilter, lfgHidePastFilter, lfgCruiseDayFilter} = useScheduleFilter();
  const {isLoggedIn} = useAuth();
  const {data, isFetched, isFetching, refetch} = useLfgListQuery({
    endpoint: endpoint,
    excludeFezType: [FezType.open, FezType.closed],
    fezType: lfgTypeFilter,
    // @TODO we intend to fix this some day. Upstream Swiftarr issue.
    cruiseDay: lfgCruiseDayFilter ? lfgCruiseDayFilter - 1 : undefined,
    hidePast: lfgHidePastFilter,
    options: {
      enabled: isLoggedIn,
    },
  });
  const {commonStyles} = useStyles();
  const navigation = useLFGStackNavigation();
  const isFocused = useIsFocused();
  const {setFez} = useTwitarr();
  const {closeFezSocket} = useSocket();

  let lfgList: FezData[] = [];
  data?.pages.map(page => {
    page.fezzes.map(lfg => {
      lfgList.push(lfg);
    });
  });

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ScheduleLfgCruiseDayFilterMenu />
          <ScheduleLfgFilterMenu />
          <ScheduleLfgListMenu />
        </HeaderButtons>
      </View>
    );
  }, [isLoggedIn]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
    if (isFocused) {
      closeFezSocket();
      setFez(undefined);
    }
  }, [closeFezSocket, getNavButtons, isFocused, navigation, setFez]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <PaddedContentView padTop={true}>
          {isFetched && lfgList.length === 0 && (
            <View key={'noResults'} style={[commonStyles.paddingVerticalSmall]}>
              <Text>No Results</Text>
            </View>
          )}
          {lfgList.map((lfg, i) => (
            <View key={i} style={[commonStyles.marginBottom]}>
              <LfgCard
                showDay={true}
                lfg={lfg}
                onPress={() => navigation.push(LfgStackComponents.lfgScreen, {fezID: lfg.fezID})}
              />
            </View>
          ))}
        </PaddedContentView>
      </ScrollingContentView>
      <LfgFAB />
    </AppView>
  );
};
