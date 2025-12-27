import {useNavigation} from '@react-navigation/native';
import React from 'react';
// @ts-ignore
import VideoPlayer from 'react-native-video-controls';

import {useStyles} from '#src/Context/Contexts/StyleContext';

// iOS Simulator cannot play h265 content, only h264 and other formats.
// So I re-encoded Chall's file to function in both. It's significantly larger,
// not sure that's a great idea. H265=465K, H264=2.3M.
// It should work just fine on real devices.
// @ts-ignore
import LighterVideo from '#assets/RockBalladMode_h264.mp4';

export const LighterScreen = () => {
  const {commonStyles} = useStyles();
  const navigation = useNavigation();

  return (
    <VideoPlayer
      source={LighterVideo}
      style={commonStyles.backgroundVideo}
      repeat={true}
      disableTimer={true}
      disableVolume={true}
      disableSeekbar={true}
      disablePlayPause={true}
      disableFullscreen={true}
      onBack={() => navigation.goBack()}
      // https://stackoverflow.com/questions/55076018/problem-why-react-native-video-does-not-play-video-in-full-screen
      resizeMode={'cover'}
    />
  );
};
