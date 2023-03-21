import {AppView} from '../../Views/AppView';
import {Divider, useTheme} from 'react-native-paper';
import React, {useCallback, useState} from 'react';
import {AppContainerView} from '../../Views/AppContainerView';
import {RefreshControl, ScrollView} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {Searchbar, SegmentedButtons, List} from 'react-native-paper';
import {SeamailListItem} from "../../Lists/Seamail/SeamailListItem";
import {FezListData} from "../../../libraries/Structs/ControllerStructs";

export const SeamailView = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn} = useUserData();
  // const {setUserNotificationData} = useUserNotificationData();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [value, setValue] = React.useState('');

  const {data, refetch} = useQuery<FezListData>({
    queryKey: ['/fez/joined?type=closed&type=open'],
    enabled: isLoggedIn,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);
  // console.log(data);

  const onChangeSearch = query => setSearchQuery(query);

  return (
    <AppView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Divider bold={true} />
        <AppContainerView>
          <Searchbar placeholder={'Search messages'} onChangeText={onChangeSearch} value={searchQuery} />
          <SegmentedButtons
            value={value}
            onValueChange={setValue}
            buttons={[
              {
                value: 'grant',
                label: 'Grant',
              },
              {
                value: 'moderator',
                label: 'Moderator',
              },
              {
                value: 'twitarrteam',
                label: 'TwitarrTeam',
              },
            ]}
          />
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
