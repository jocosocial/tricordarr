import React from 'react';
import {Platform} from 'react-native';

import {KrakenView} from '#src/Components/Views/Static/KrakenView';
import {NotImplementedView} from '#src/Components/Views/Static/NotImplementedView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';

export const MicroKaraokeListScreen = () => {
  // const {data, refetch, isFetching} = useMicroKaraokeSonglistQuery();
  // console.log(data);
  const {appConfig} = useConfig();

  // if (data === undefined) {
  //   return <LoadingView />;
  // }

  // return (
  //   <AppView>
  //     <ScrollingContentView
  //       isStack={true}
  //       refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
  //       {data.map(mkSong => {
  //         return <MicroKaraokeSongListItem mkSong={mkSong} key={mkSong.songID} />;
  //       })}
  //     </ScrollingContentView>
  //   </AppView>
  // );
  if (Platform.OS === 'ios' && !appConfig.enableExperiments) {
    return <KrakenView />;
  }
  return <NotImplementedView />;
};
