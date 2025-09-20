import {AppView} from '#src/Views/AppView.tsx';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {PerformerType, usePerformersQuery} from '#src/Queries/Performer/PerformerQueries.ts';
import {PerformerHeaderData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {FlatList, RefreshControl, View, StyleSheet} from 'react-native';
import {AppFlatList} from '#src/Lists/AppFlatList.tsx';
import {LoadingView} from '#src/Views/Static/LoadingView.tsx';
import {PerformerTypeButtons} from '#src/Buttons/SegmentedButtons/PerformerTypeButtons.tsx';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator.tsx';
import {PerformerHeaderCard} from '#src/Cards/Performer/PerformerHeaderCard.tsx';
import {useStyles} from '#src/Context/Contexts/StyleContext.ts';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Buttons/MaterialHeaderButton.tsx';
import {PerformerListActionsMenu} from '#src/Menus/Performer/PerformerListActionsMenu.tsx';
import {useAuth} from '#src/Context/Contexts/AuthContext.ts';
import {NotLoggedInView} from '#src/Views/Static/NotLoggedInView.tsx';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.performerListScreen>;

export const PerformerListScreen = ({navigation, route}: Props) => {
  const [performerType, setPerformerType] = useState<PerformerType>(route.params?.performerType || 'official');
  const {data, refetch, isFetching, hasNextPage, fetchNextPage, isLoading} = usePerformersQuery(performerType);
  const flatListRef = useRef<FlatList<PerformerHeaderData>>(null);
  const {commonStyles, styleDefaults} = useStyles();
  const {isLoggedIn} = useAuth();

  const styles = StyleSheet.create({
    cardContainer: {
      width: 180,
    },
    column: {
      ...commonStyles.justifySpaceEvenly,
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

  const getHeaderButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <PerformerListActionsMenu />
        </HeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getHeaderButtons,
    });
  }, [navigation, getHeaderButtons]);

  const performers = data?.pages.flatMap(p => p.performers) || [];

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <AppFlatList
        flatListRef={flatListRef}
        renderItem={renderItem}
        data={performers}
        hasNextPage={hasNextPage}
        handleLoadNext={fetchNextPage}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        renderListHeader={renderListHeader}
        renderListFooter={renderListFooter}
        numColumns={2}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.column}
        maintainViewPosition={false}
      />
    </AppView>
  );
};
