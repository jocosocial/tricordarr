import React from 'react';
import {RefreshControl} from 'react-native';

import {MicroKaraokeSongListItem} from '#src/Components/Lists/Items/MicroKaraokeSongListItem';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useMicroKaraokeSonglistQuery} from '#src/Queries/MicroKaraoke/MicroKaraokeQueries';

export const MicroKaraokeListScreen = () => {
  const {data, refetch, isFetching} = useMicroKaraokeSonglistQuery();
  console.log(data);

  if (data === undefined) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        {data.map(mkSong => {
          return <MicroKaraokeSongListItem mkSong={mkSong} key={mkSong.songID} />;
        })}
      </ScrollingContentView>
    </AppView>
  );
};
