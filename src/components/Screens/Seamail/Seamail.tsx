import {AppView} from '../../Views/AppView';
import {Divider, useTheme} from 'react-native-paper';
import React, {useCallback, useState} from 'react';
import {AppContainerView} from '../../Views/AppContainerView';
import {RefreshControl, ScrollView} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {SegmentedButtons, List} from 'react-native-paper';
import {SeamailListItem} from "../../Lists/Seamail/SeamailListItem";
import {FezListData} from "../../../libraries/Structs/ControllerStructs";
import {commonStyles} from "../../../styles";
import {SeamailSearchBar} from "../../Search/SeamailSearchBar";
import {SeamailAccountButtons} from "../../Buttons/SeamailAccountButtons";
import {NotLoggedInView} from "../../Views/NotLoggedInView";

export const SeamailScreen = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn} = useUserData();
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

  return (
    <AppView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Divider bold={true} />
        <AppContainerView>
          <SeamailSearchBar />
          <SeamailAccountButtons />
          <List.Section>
            {data && data.fezzes.map(fez => (
              <SeamailListItem key={fez.fezID} fez={fez} />
            ))}
          </List.Section>
        </AppContainerView>
      </ScrollView>
    </AppView>
  );
};
