import {RefreshControl, View} from 'react-native';
import {SeamailFlatList} from '../../Lists/Seamail/SeamailFlatList.tsx';
import React, {useCallback, useEffect, useState} from 'react';
import {useSeamailListQuery} from '../../Queries/Fez/FezQueries.ts';
import {FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {AppView} from '../../Views/AppView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ChatStackParamList, ChatStackScreenComponents} from '../../Navigation/Stacks/ChatStackNavigator.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';

type SeamailArchivedScreenProps = NativeStackScreenProps<
  ChatStackParamList,
  ChatStackScreenComponents.seamailArchivedScreen
>;

export const SeamailArchivedScreen = ({navigation}: SeamailArchivedScreenProps) => {
  const {data, refetch, isFetchingNextPage, hasNextPage, fetchNextPage, isFetching} = useSeamailListQuery({
    archived: true,
  });
  const [fezList, setFezList] = useState<FezData[]>([]);

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.seamailHelpScreen)}
          />
        </HeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [navigation, getNavButtons]);

  useEffect(() => {
    if (data && data.pages) {
      setFezList(data.pages.flatMap(p => p.fezzes));
    }
  }, [data]);

  return (
    <AppView>
      <SeamailFlatList
        fezList={fezList}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        onEndReached={handleLoadNext}
        hasNextPage={hasNextPage}
        handleLoadNext={handleLoadNext}
      />
    </AppView>
  );
};
