import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
// import {RefreshControl} from 'react-native';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';
// import VideoPlayer from 'react-native-video-controls';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppView} from '#src/Components/Views/AppView';
// import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
// import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {createLogger} from '#src/Libraries/Logger';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useMicroKaraokeSongQuery} from '#src/Queries/MicroKaraoke/MicroKaraokeQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

const logger = createLogger('MicroKaraokeSongScreen.tsx');

type Props = StackScreenProps<MainStackParamList, MainStackComponents.microKaraokeSongScreen>;

export const MicroKaraokeSongScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.microkaraoke}>
        <MicroKaraokeSongScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const MicroKaraokeSongScreenInner = ({route}: Props) => {
  logger.debug('songID', route.params.songID);
  const {data} = useMicroKaraokeSongQuery(route.params.songID);
  const [currentIndex, setCurrentIndex] = useState(0);
  const {commonStyles} = useStyles();

  if (!data) {
    return <LoadingView />;
  }

  const filePaths = data.snippetVideoURLs.map((url: string) => {
    // Remove query parameters before extracting filename
    const urlWithoutQuery = url.split('?')[0];
    const fileName = urlWithoutQuery.split('/').pop();
    return `${RNFS.DocumentDirectoryPath}/${fileName}`;
  });

  const handleEnd = () => {
    if (currentIndex < filePaths.length - 1) {
      logger.debug('NEXT');
      setCurrentIndex(currentIndex + 1);
    } else {
      logger.debug('end');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      logger.debug('PREVIOUS');
      setCurrentIndex(currentIndex - 1);
    } else {
      logger.debug('beginning');
    }
  };

  logger.debug('filePaths', filePaths, 'current', filePaths[currentIndex]);
  return (
    <AppView>
      {/*<ScrollingContentView*/}
      {/*  isStack={true}*/}
      {/*  refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>*/}
      <Video
        style={commonStyles.flex}
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
