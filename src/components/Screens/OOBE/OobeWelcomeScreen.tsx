import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import React from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents, OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator.tsx';
import {OobeButtonsView} from '../../Views/OobeButtonsView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {Image, StyleSheet} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
// @ts-ignore
import tricordarr from '../../../../assets/PlayStore/tricordarr.jpg';
import {AppImage} from '../../Images/AppImage.tsx';
import {encode as base64_encode} from 'base-64';
import DeviceInfo from 'react-native-device-info';
import {useAppTheme} from '../../../Styles/Theme.ts';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {useFocusEffect} from '@react-navigation/native';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeWelcomeScreen>;

export const OobeWelcomeScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {preRegistrationAvailable, setPreRegistrationMode} = useConfig();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    text: commonStyles.textCenter,
    image: commonStyles.roundedBorderLarge,
  });

  const onPreRegistrationPress = () => {
    setPreRegistrationMode(true);
    navigation.push(OobeStackComponents.oobeServerScreen);
  };

  useFocusEffect(() => {
    console.log('[OobeWelcomeScreen.tsx] disabling preregistration mode');
    setPreRegistrationMode(false);
  });

  // Un/Semi came from Drew in https://www.youtube.com/watch?v=BLFllFtPD8k
  return (
    <AppView safeEdges={['top', 'bottom']}>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text style={styles.text} variant={'displayLarge'}>
            Welcome to Twitarr!
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={styles.text}>The un/semi-official on-board social media platform of the JoCo Cruise.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <AppImage
            mode={'scaledimage'}
            image={{
              dataURI: Image.resolveAssetSource(tricordarr).uri,
              mimeType: 'image/jpeg',
              fileName: 'tricordarr.jpg',
              base64: base64_encode(tricordarr),
            }}
            style={styles.image}
            disableTouch={true}
          />
        </PaddedContentView>
        <PaddedContentView>
          <Text style={styles.text} variant={'labelLarge'}>
            Version {DeviceInfo.getVersion()} (Build {DeviceInfo.getBuildNumber()}){'\n'}
            {__DEV__ ? 'Development Mode' : undefined}
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView
        rightOnPress={() => navigation.push(OobeStackComponents.oobeServerScreen)}
        leftOnPress={onPreRegistrationPress}
        leftButtonColor={theme.colors.twitarrNeutralButton}
        leftText={'Pre-Registration'}
        leftDisabled={!preRegistrationAvailable}
        leftButtonTextColor={theme.colors.onTwitarrNeutralButton}
      />
    </AppView>
  );
};
