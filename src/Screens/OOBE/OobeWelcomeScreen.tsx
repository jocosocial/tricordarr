import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {StyleSheet} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {defaultAppConfig} from '#src/Libraries/AppConfig';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

// @ts-ignore
import tricordarr from '#assets/PlayStore/tricordarr.jpg';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeWelcomeScreen>;

export const OobeWelcomeScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {findOrCreateSession} = useSession();
  const {theme} = useAppTheme();

  const styles = StyleSheet.create({
    text: commonStyles.textCenter,
    image: commonStyles.roundedBorderLarge,
  });

  const onPreRegistrationPress = async () => {
    // Create or find preregistration session and persist immediately
    await findOrCreateSession(defaultAppConfig.preRegistrationServerUrl, true);
    navigation.push(OobeStackComponents.oobeServerScreen);
  };

  const onPress = async () => {
    // Create or find production session and persist immediately
    await findOrCreateSession(defaultAppConfig.serverUrl, false);
    navigation.push(OobeStackComponents.oobeServerScreen);
  };

  // This used to have a useFocusEffect that would disable preregistration mode
  // which caught if you entered prereg and then changed your mind. This actually
  // sucks as a pattern so I'm turning it off and making that happen depending on
  // how you proceed.

  // Un/Semi came from Drew in https://www.youtube.com/watch?v=BLFllFtPD8k
  return (
    <AppView>
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
            image={AppImageMetaData.fromAsset(tricordarr, 'tricordarr.jpg')}
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
        rightOnPress={onPress}
        leftOnPress={onPreRegistrationPress}
        leftButtonColor={theme.colors.twitarrNeutralButton}
        leftText={'Pre-Registration'}
        leftButtonTextColor={theme.colors.onTwitarrNeutralButton}
      />
    </AppView>
  );
};
