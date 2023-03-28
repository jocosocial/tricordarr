import {AppView} from '../../Views/AppView';
import {RefreshControl} from 'react-native';
import React, {useCallback, useState} from 'react';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useQuery} from '@tanstack/react-query';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';

export type SeamailScreenParams = {
  fezID: string;
  title: string;
};

export type SeamailScreenParamList = {
  SeamailScreen: SeamailScreenParams;
};

export type Props = NativeStackScreenProps<
  SeamailScreenParamList,
  SeamailStackScreenComponents.seamailScreen,
  NavigatorIDs.seamailStack
>;

export const SeamailScreen = ({navigation, route}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn, isLoading} = useUserData();
  // const {accessLevel} = useUserData();
  // navigation.setParams({title: route.params.title});

  const {data, refetch} = useQuery<FezData>({
    queryKey: [`/fez/${route.params.fezID}`],
    enabled: isLoggedIn && !isLoading && !!route.params.fezID,
  });

  console.log(data);

  // const isPrivileged = UserAccessLevel.isPrivileged(accessLevel);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <Text>{data && data.lastModificationTime.toString()}</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
