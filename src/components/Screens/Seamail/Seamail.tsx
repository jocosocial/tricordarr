import React, {useCallback, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {Divider, List} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {AppView} from '../../Views/AppView';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {SeamailListItem} from '../../Lists/Seamail/SeamailListItem';
import {FezListData} from '../../../libraries/Structs/ControllerStructs';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';
import {SeamailAccountButtons} from '../../Buttons/SeamailAccountButtons';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {LoadingView} from '../../Views/Static/LoadingView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';

export const SeamailScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn, isLoading} = useUserData();
  // const {setUserNotificationData} = useUserNotificationData();

  const {data, refetch} = useQuery<FezListData>({
    queryKey: ['/fez/joined?type=closed&type=open'],
    enabled: isLoggedIn,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View>
          <PaddedContentView>
            <SeamailSearchBar />
          </PaddedContentView>
          <SeamailAccountButtons />
          <List.Section>
            <Divider />
            {data &&
              data.fezzes.map(fez => (
                <>
                  <SeamailListItem key={fez.fezID} fez={fez} />
                  <Divider />
                </>
              ))}
          </List.Section>
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
