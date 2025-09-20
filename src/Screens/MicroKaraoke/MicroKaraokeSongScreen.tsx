import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {RefreshControl} from 'react-native';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useMicroKaraokeSongQuery} from '#src/Queries/MicroKaraoke/MicroKaraokeQueries';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.microKaraokeSongScreen>;

export const MicroKaraokeSongScreen = ({route}: Props) => {
  console.log(route.params.songID);
  const {data, refetch, isFetching} = useMicroKaraokeSongQuery(route.params.songID);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!data) {
    return <LoadingView />;
  }

  const filePaths = data.snippetVideoURLs.map((url: string) => {
    const fileName = url.split('/').pop();
    return `${RNFS.DocumentDirectoryPath}/${fileName}`;
  });

  const handleEnd = () => {
    if (currentIndex < filePaths.length - 1) {
      console.log('NEXT');
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log('end');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      console.log('NEXT');
      setCurrentIndex(currentIndex - 1);
    } else {
      console.log('beginning');
    }
  };

  console.log(filePaths);
  console.log(filePaths[currentIndex]);
  return (
    <AppView>
      {/*<ScrollingContentView*/}
      {/*  isStack={true}*/}
      {/*  refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>*/}
      <Video
        style={{flex: 1}}
        source={{uri: filePaths[currentIndex]}}
        onEnd={handleEnd}
        controls={true}
        resizeMode={'cover'}
      />
      {/*{data.snippetVideoURLs.map((url, i) => (*/}
      {/*  <SnippetListItem key={i} url={url} />*/}
      {/*))}*/}
      {/*</ScrollingContentView>*/}
      <PrimaryActionButton buttonText={'Previous'} onPress={handlePrevious} />
      <PrimaryActionButton buttonText={'Next'} onPress={handleEnd} />
    </AppView>
  );
};
