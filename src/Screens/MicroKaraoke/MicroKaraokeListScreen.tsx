import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import React from 'react';
import {RefreshControl} from 'react-native';
import {useMicroKaraokeSonglistQuery} from '#src/Queries/MicroKaraoke/MicroKaraokeQueries';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {MicroKaraokeSongListItem} from '#src/Components/Lists/Items/MicroKaraokeSongListItem';

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
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        {data.map(mkSong => {
          return <MicroKaraokeSongListItem mkSong={mkSong} key={mkSong.songID} />;
        })}
      </ScrollingContentView>
    </AppView>
  );
};
