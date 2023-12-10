import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';
import {RefreshControl, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {LfgCard} from '../../Cards/Schedule/LfgCard';
import {FezType} from '../../../libraries/Enums/FezType';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {ScheduleLfgFilterMenu} from '../../Menus/LFG/ScheduleLfgFilterMenu';
import {LfgStackComponents} from '../../../libraries/Enums/Navigation';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {ScheduleLfgCruiseDayFilterMenu} from '../../Menus/LFG/ScheduleLfgCruiseDayFilterMenu';
import {ScheduleLfgListMenu} from '../../Menus/LFG/ScheduleLfgListMenu';
import {LfgFAB} from '../../Buttons/FloatingActionButtons/LfgFAB';
import {useIsFocused} from '@react-navigation/native';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useSocket} from '../../Context/Contexts/SocketContext';
import {useLFGStackNavigation} from '../../Navigation/Stacks/LFGStackNavigator';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {FezListActions} from '../../Reducers/Fez/FezListReducers';
import {LoadingView} from '../../Views/Static/LoadingView';

interface LfgJoinedScreenProps {
  endpoint: 'open' | 'joined' | 'owner';
}

export const LfgListScreen = ({endpoint}: LfgJoinedScreenProps) => {
  const {lfgTypeFilter, lfgHidePastFilter, lfgCruiseDayFilter} = useFilter();
  const {isLoggedIn} = useAuth();
  const {data, isFetched, isFetching, refetch, isLoading} = useLfgListQuery({
    endpoint: endpoint,
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
  const {setLfg, lfgList, dispatchLfgList} = useTwitarr();
  const {closeFezSocket} = useSocket();

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
      setLfg(undefined);
    }
  }, [closeFezSocket, getNavButtons, isFocused, navigation, setLfg]);

  useEffect(() => {
    if (data && data.pages && isFocused) {
      dispatchLfgList({
        type: FezListActions.set,
        fezList: data.pages.flatMap(p => p.fezzes),
      });
    }
  }, [data, dispatchLfgList, isFocused]);

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
