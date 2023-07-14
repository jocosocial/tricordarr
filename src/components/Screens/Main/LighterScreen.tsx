import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
// @ts-ignore
import LighterVideo from '../../../../assets/RockBalladMode.mp4';
import {AppView} from '../../Views/AppView';
import VideoPlayer from 'react-native-video-controls';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';

export const LighterScreen = () => {
  const {commonStyles} = useStyles();
  const rootNavigator = useRootStack();

  return (
    <AppView>
      <VideoPlayer
        source={LighterVideo}
        style={commonStyles.backgroundVideo}
        repeat={true}
        disableTimer={true}
        disableVolume={true}
        disableSeekbar={true}
        disablePlayPause={true}
        disableFullscreen={true}
        onBack={() => rootNavigator.goBack()}
        // https://stackoverflow.com/questions/55076018/problem-why-react-native-video-does-not-play-video-in-full-screen
        resizeMode={'cover'}
      />
    </AppView>
  );
};
