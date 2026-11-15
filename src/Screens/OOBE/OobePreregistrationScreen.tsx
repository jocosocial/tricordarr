import React from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useAppImage} from '#src/Context/Contexts/AppImageContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {OobeLocation} from '#src/Enums/OobeLocation';
import {OobeStackComponents, useOobeStack} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';

// @ts-ignore
import tricordarr from '#assets/PlayStore/tricordarr.jpg';

/**
 * "Welcome Aboard": the start of leaving pre-registration for the ship, opened from the
 * pre-registration banner.
 */
export const OobePreregistrationScreen = () => {
  const {commonStyles} = useStyles();
  const navigation = useOobeStack();
  const {appConfig} = useConfig();
  const {fromAsset} = useAppImage();

  const styles = StyleSheet.create({
    text: commonStyles.textCenter,
    boldText: {
      ...commonStyles.bold,
      ...commonStyles.textCenter,
    },
    image: commonStyles.roundedBorderLarge,
  });

  // Boarding is the setup flow against the production server (the default one). Nothing about the
  // current session changes until that flow ends with a login, a new account, or proceeding
  // without one, so backing out at any point leaves the pre-registration session exactly as it
  // was. That final step is also the cutoff: it deletes the pre-registration server's accounts.
  const onPress = () => {
    navigation.push(OobeStackComponents.oobeServerScreen, {
      mode: 'boarding',
      location: OobeLocation.ship,
      serverUrl: appConfig.serverUrl,
    });
  };

  // First screen of a flow pushed over the app, so going back returns to wherever that was.
  const onBackPress = () => {
    navigation.goBack();
  };

  return (
    <AppView disablePreRegistrationWarning={true}>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text style={styles.text} variant={'displayLarge'}>
            Welcome Aboard!
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <AppImage
            mode={'scaledimage'}
            image={fromAsset(tricordarr, 'tricordarr.jpg')}
            style={styles.image}
            disableTouch={true}
          />
        </PaddedContentView>
        <PaddedContentView>
          <Text style={styles.boldText}>Do not proceed until you are physically on the ship!</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={styles.text}>
            Ensure that your phone is in airplane mode, on ship WiFi, and you have disabled any VPNs, private DNS, or
            other network blockers.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView leftText={'Back to App'} leftOnPress={onBackPress} rightOnPress={onPress} />
    </AppView>
  );
};
