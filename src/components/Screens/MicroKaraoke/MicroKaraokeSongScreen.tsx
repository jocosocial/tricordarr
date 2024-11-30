import React from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '../../Views/AppView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {useMicroKaraokeSongQuery} from '../../Queries/MicroKaraoke/MicroKaraokeQueries.ts';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {RefreshControl} from 'react-native';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.microKaraokeSongScreen>;

export const MicroKaraokeSongScreen = ({route}: Props) => {
  console.log(route.params.songID);
  const {data, refetch, isFetching} = useMicroKaraokeSongQuery(route.params.songID);
  console.log(data);
  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <Text>Wee</Text>
      </ScrollingContentView>
    </AppView>
  );
};
