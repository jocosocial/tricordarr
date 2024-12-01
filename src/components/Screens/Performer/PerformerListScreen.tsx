import {AppView} from '../../Views/AppView.tsx';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {PerformerType, usePerformersQuery} from '../../Queries/Performer/PerformerQueries.ts';
import {PerformerHeaderData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {FlatList, RefreshControl, View, StyleSheet} from 'react-native';
import {AppFlatList} from '../../Lists/AppFlatList.tsx';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {PerformerTypeButtons} from '../../Buttons/SegmentedButtons/PerformerTypeButtons.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {PerformerHeaderCard} from '../../Cards/Performer/PerformerHeaderCard.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.performerListScreen>;

export const PerformerListScreen = ({navigation, route}: Props) => {
  const [performerType, setPerformerType] = useState<PerformerType>(route.params?.performerType || 'official');
  const {data, refetch, isFetching, hasNextPage, fetchNextPage, isLoading} = usePerformersQuery(performerType);
  const flatListRef = useRef<FlatList<PerformerHeaderData>>(null);
  const {commonStyles, styleDefaults} = useStyles();

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
  });

  const renderItem = ({item}: {item: PerformerHeaderData}) => {
    return (
      <View style={styles.cardContainer}>
        <PerformerHeaderCard header={item} />
      </View>
    );
  };

  const renderListHeader = () => {
    return (
      <PaddedContentView>
        <PerformerTypeButtons performerType={performerType} setPerformerType={setPerformerType} />
      </PaddedContentView>
    );
  };

  const getHeaderButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.performerHelpScreen)}
          />
        </HeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getHeaderButtons,
    });
  }, [navigation, getHeaderButtons]);

  const performers = data?.pages.flatMap(p => p.performers) || [];

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
        numColumns={2}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.column}
      />
    </AppView>
  );
};
