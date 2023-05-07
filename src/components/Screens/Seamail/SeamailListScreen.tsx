import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {Divider} from 'react-native-paper';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {AppView} from '../../Views/AppView';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {SeamailListItem} from '../../Lists/Items/SeamailListItem';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';
import {SeamailAccountButtons} from '../../Buttons/SeamailAccountButtons';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {LoadingView} from '../../Views/Static/LoadingView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SeamailNewFAB} from '../../Buttons/FloatingActionButtons/SeamailNewFAB';
import {ListSection} from '../../Lists/ListSection';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';

export const SeamailListScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn, isLoading, isPrivileged} = useUserData();
  const {asPrivilegedUser} = usePrivilege();
  const {data, refetch} = useSeamailQuery(asPrivilegedUser);
  const {fezList, setFezList} = useTwitarr();

  useEffect(() => {
    setFezList(data);
    return () => setFezList(undefined);
  }, [data, setFezList]);

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
            {fezList &&
              fezList.fezzes.map(fez => (
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
