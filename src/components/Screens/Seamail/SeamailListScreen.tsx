import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {Divider} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {AppView} from '../../Views/AppView';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {SeamailListItem} from '../../Lists/Items/SeamailListItem';
import {FezListData} from '../../../libraries/Structs/ControllerStructs';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';
import {SeamailAccountButtons} from '../../Buttons/SeamailAccountButtons';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {LoadingView} from '../../Views/Static/LoadingView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SeamailNewFAB} from '../../Buttons/FloatingActionButtons/SeamailNewFAB';
import {ListSection} from '../../Lists/ListSection';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';

export const SeamailListScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn, isLoading, isPrivileged} = useUserData();
  const {asPrivilegedUser, clearPrivileges} = usePrivilege();
  // const {setUserNotificationData} = useUserNotificationData();
  console.log('asPrivilegedUser', asPrivilegedUser);
  const {data, refetch} = useSeamailQuery(asPrivilegedUser);

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
          {isPrivileged && (
            <PaddedContentView>
              <SeamailAccountButtons />
            </PaddedContentView>
          )}
          <ListSection>
            <Divider bold={true} />
            {data &&
              data.fezzes.map(fez => (
                <View key={fez.fezID}>
                  <SeamailListItem fez={fez} />
                  <Divider bold={true} />
                </View>
              ))}
          </ListSection>
        </View>
      </ScrollingContentView>
      <SeamailNewFAB />
    </AppView>
  );
};
