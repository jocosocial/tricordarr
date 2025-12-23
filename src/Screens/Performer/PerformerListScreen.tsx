import {StackScreenProps} from '@react-navigation/stack';
import {FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {RefreshControl, StyleSheet, View} from 'react-native';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PerformerTypeButtons} from '#src/Components/Buttons/SegmentedButtons/PerformerTypeButtons';
import {PerformerHeaderCard} from '#src/Components/Cards/Performer/PerformerHeaderCard';
import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {PerformerListActionsMenu} from '#src/Components/Menus/Performer/PerformerListActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {PerformerType, usePerformersQuery} from '#src/Queries/Performer/PerformerQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PerformerHeaderData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.performerListScreen>;

export const PerformerListScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.performers} urlPath={'/performers'}>
        <PerformerListScreenInner {...props} />
      </DisabledFeatureScreen>
    </LoggedInScreen>
  );
};

const PerformerListScreenInner = ({navigation, route}: Props) => {
  const [performerType, setPerformerType] = useState<PerformerType>(route.params?.performerType || 'official');
  const {data, refetch, isFetching, fetchNextPage, isLoading} = usePerformersQuery(performerType);
  const {commonStyles, styleDefaults} = useStyles();
  const flashListRef = useRef<FlashListRef<PerformerHeaderData>>(null);
  const [performers, setPerformers] = useState<PerformerHeaderData[]>([]);

  const styles = StyleSheet.create({
    cardContainer: {
      ...commonStyles.paddingSmall,
    },
    content: {
      gap: styleDefaults.marginSize,
    },
    list: {
      ...commonStyles.paddingVertical,
    },
  });

  const renderItem = useCallback(
    ({item}: {item: PerformerHeaderData}) => {
      return (
        <View style={styles.cardContainer}>
          <PerformerHeaderCard header={item} />
        </View>
      );
    },
    [styles.cardContainer],
  );

  const renderListHeader = useCallback(() => {
    return (
      <PaddedContentView padTop={true}>
        <PerformerTypeButtons performerType={performerType} setPerformerType={setPerformerType} />
      </PaddedContentView>
    );
  }, [performerType]);

  const renderListFooter = useCallback(() => <PaddedContentView />, []);

  const keyExtractor = useCallback((item: PerformerHeaderData, index: number) => {
    return item.id || `performer-${item.name}-${index}`;
  }, []);

  const getHeaderButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <PerformerListActionsMenu />
        </MaterialHeaderButtons>
      </View>
    );
  }, []);

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
    return <LoadingView />;
  }

  return (
    <AppView>
      <AppFlashList
        ref={flashListRef}
        renderItem={renderItem}
        data={performers}
        keyExtractor={keyExtractor}
        handleLoadNext={fetchNextPage}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        renderListHeader={renderListHeader}
        renderListFooter={renderListFooter}
        numColumns={2}
      />
    </AppView>
  );
};
