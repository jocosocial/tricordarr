import {StackScreenProps} from '@react-navigation/stack';
import {FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PerformerTypeButtons} from '#src/Components/Buttons/SegmentedButtons/PerformerTypeButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {PerformerFlashList} from '#src/Components/Lists/Performer/PerformerFlashList';
import {PerformerListActionsMenu} from '#src/Components/Menus/Performer/PerformerListActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {PerformerType, usePerformersQuery} from '#src/Queries/Performer/PerformerQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {MaintenanceModeScreen} from '#src/Screens/Checkpoint/MaintenanceModeScreen';
import {PerformerHeaderData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.performerListScreen>;

export const PerformerListScreen = (props: Props) => {
  return (
    <MaintenanceModeScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.performers} urlPath={'/performers'}>
        <PerformerListScreenInner {...props} />
      </DisabledFeatureScreen>
    </MaintenanceModeScreen>
  );
};

const PerformerListScreenInner = ({navigation, route}: Props) => {
  const [performerType, setPerformerType] = useState<PerformerType>(route.params?.performerType || 'official');
  const {data, refetch, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading} = usePerformersQuery({
    performerType: performerType,
  });
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isFetching});
  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  const flashListRef = useRef<FlashListRef<PerformerHeaderData>>(null);
  const [performers, setPerformers] = useState<PerformerHeaderData[]>([]);

  const renderListHeader = useCallback(() => {
    return (
      <PaddedContentView padTop={true}>
        <PerformerTypeButtons performerType={performerType} setPerformerType={setPerformerType} />
      </PaddedContentView>
    );
  }, [performerType]);

  const getHeaderButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Search'}
            iconName={AppIcons.search}
            onPress={() =>
              navigation.push(MainStackComponents.performerSearchScreen, {
                performerType: performerType,
              })
            }
          />
          <PerformerListActionsMenu />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation, performerType]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getHeaderButtons,
    });
  }, [navigation, getHeaderButtons]);

  /**
   * Effect to set the performers list when the data loads.
   */
  useEffect(() => {
    if (data) {
      setPerformers(data.pages.flatMap(p => p.performers));
    }
  }, [data]);

  if (isLoading) {
    return (
      <AppView>
        <LoadingView />
      </AppView>
    );
  }

  return (
    <AppView>
      <PerformerFlashList
        ref={flashListRef}
        items={performers}
        handleLoadNext={handleLoadNext}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderListHeader={renderListHeader}
      />
    </AppView>
  );
};
