import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

import {OobeLocationCard} from '#src/Components/Cards/OobeLocationCard';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useAppImage} from '#src/Context/Contexts/AppImageContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {OobeLocation} from '#src/Enums/OobeLocation';
import {createLogger} from '#src/Libraries/Logger';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';

const logger = createLogger('OobeLocationScreen.tsx');

// @ts-ignore
import mainviewDay from '#assets/mainview_day.jpg';
// @ts-ignore
import preregistration from '#assets/preregistration.jpg';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeLocationScreen>;

export const OobeLocationScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {currentSession, updateSession} = useSession();
  const {appConfig} = useConfig();
  const {oobeCompleted} = useOobe();
  const {fromAsset} = useAppImage();
  const [busy, setBusy] = useState(false);

  const styles = StyleSheet.create({
    text: commonStyles.textCenter,
  });

  const onLocationPress = async (location: OobeLocation) => {
    if (!currentSession) {
      logger.warn('Cannot update session: no current session');
      return;
    }
    setBusy(true);
    try {
      const serverUrl = location === OobeLocation.land ? appConfig.preRegistrationServerUrl : appConfig.serverUrl;
      // Preserve existing server URL when re-running OOBE after completion.
      await updateSession(currentSession.sessionID, oobeCompleted ? {} : {serverUrl});
      navigation.push(OobeStackComponents.oobeServerScreen, {location});
    } finally {
      setBusy(false);
    }
  };

  const cardsDisabled = busy || !currentSession;

  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text style={styles.text} variant={'headlineMedium'}>
            Where are you right now?
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={styles.text}>
            Twitarr runs a limited pre-registration server before the cruise sails, and the full server once we're on
            board. Tap whichever matches where you are right now. This just sets a starting point - you can still change
            the server on the next screen.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <OobeLocationCard
            title={'On Land'}
            description={
              "The cruise hasn't sailed yet and you're probably still packing. Get a head start by setting up your account now."
            }
            image={fromAsset(preregistration, 'preregistration.jpg')}
            onPress={() => onLocationPress(OobeLocation.land)}
            disabled={cardsDisabled}
            testID={'oobeLocationLand-card'}
          />
        </PaddedContentView>
        <PaddedContentView>
          <OobeLocationCard
            title={'On Ship'}
            description={"You're standing on the ship, connected to ship WiFi, ready to go."}
            image={fromAsset(mainviewDay, 'mainview_day.jpg')}
            onPress={() => onLocationPress(OobeLocation.ship)}
            disabled={cardsDisabled}
            testID={'oobeLocationShip-card'}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
