import React from 'react';

import {isIOS} from '#src/Libraries/Platform/Detection';

import {KrakenView} from '#src/Components/Views/Static/KrakenView';
import {NotImplementedView} from '#src/Components/Views/Static/NotImplementedView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

export const MicroKaraokeListScreen = () => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.microkaraoke}>
        <MicroKaraokeListScreenInner />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const MicroKaraokeListScreenInner = () => {
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
  if (isIOS && !appConfig.enableExperiments) {
    return <KrakenView />;
  }
  return <NotImplementedView />;
};
