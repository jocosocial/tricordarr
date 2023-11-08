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
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScheduleStackParamList} from '../../Navigation/Stacks/ScheduleStackNavigator';
import {NavigatorIDs, ScheduleStackComponents} from '../../../libraries/Enums/Navigation';
import {useScheduleFilter} from '../../Context/Contexts/ScheduleFilterContext';
import {ScheduleLfgCruiseDayFilterMenu} from '../../Menus/ScheduleLfgCruiseDayFilterMenu';
import {ScheduleLfgListMenu} from '../../Menus/ScheduleLfgListMenu';
import {ScheduleFAB} from '../../Buttons/FloatingActionButtons/ScheduleFAB';

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.lfgJoinedScreen,
  NavigatorIDs.scheduleStack
>;

export const LfgJoinedScreen = ({navigation}: Props) => {
  const {lfgTypeFilter, lfgHidePastFilter, lfgCruiseDayFilter} = useScheduleFilter();
  const {data, isFetched, isFetching, refetch} = useLfgListQuery({
    endpoint: 'joined',
    excludeFezType: [FezType.open, FezType.closed],
    fezType: lfgTypeFilter,
    // @TODO we intend to fix this some day. Upstream Swiftarr issue.
    cruiseDay: lfgCruiseDayFilter ? lfgCruiseDayFilter - 1 : undefined,
    hidePast: lfgHidePastFilter,
  });
  const {commonStyles} = useStyles();

  let lfgList: FezData[] = [];
  data?.pages.map(page => {
    page.fezzes.map(lfg => {
      lfgList.push(lfg);
    });
  });

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ScheduleLfgCruiseDayFilterMenu />
          <ScheduleLfgFilterMenu />
          <ScheduleLfgListMenu />
        </HeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

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
                lfg={lfg}
                onPress={() => navigation.push(ScheduleStackComponents.lfgScreen, {fezID: lfg.fezID})}
              />
            </View>
          ))}
        </PaddedContentView>
      </ScrollingContentView>
      <ScheduleFAB />
    </AppView>
  );
};
