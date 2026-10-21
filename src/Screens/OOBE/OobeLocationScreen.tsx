import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {OobeLocationCard} from '#src/Components/Cards/OobeLocationCard';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useAppImage} from '#src/Context/Contexts/AppImageContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {styleDefaults} from '#src/Context/Providers/StyleProvider';
import {OobeLocation} from '#src/Enums/OobeLocation';
import {createLogger} from '#src/Libraries/Logger';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';

const logger = createLogger('OobeLocationScreen.tsx');

// @ts-ignore
import mainviewDay from '#assets/mainview_day.jpg';
// @ts-ignore
import preregistration from '#assets/preregistration.jpg';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeLocationScreen>;

// A plain View with its own style rather than PaddedContentView: this screen wants wider side
// margins than PaddedContentView's default (marginSize / 2), so most of its behavior would be
// getting overridden anyway. paddingHorizontal is doubled to the full marginSize to narrow the
// cards; paddingBottom mirrors PaddedContentView's default (small) spacing between sections.
const screenStyles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    paddingHorizontal: styleDefaults.marginSize,
    paddingBottom: styleDefaults.marginSize / 2,
  },
  section: {
    flex: 1,
    paddingHorizontal: styleDefaults.marginSize,
    paddingBottom: styleDefaults.marginSize,
  },
});

export const OobeLocationScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {currentSession, updateSession} = useSession();
  const {appConfig} = useConfig();
  const {oobeCompleted} = useOobe();
  const {fromAsset} = useAppImage();
  const [selectedLocation, setSelectedLocation] = useState<OobeLocation | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const styles = StyleSheet.create({
    text: commonStyles.textCenter,
  });

  const onNextPress = async () => {
    if (!currentSession || !selectedLocation) {
      logger.warn('Cannot update session: no current session or no location selected');
      return;
    }
    setBusy(true);
    try {
      const serverUrl =
        selectedLocation === OobeLocation.land ? appConfig.preRegistrationServerUrl : appConfig.serverUrl;
      // Preserve existing server URL when re-running OOBE after completion.
      await updateSession(currentSession.sessionID, oobeCompleted ? {} : {serverUrl});
      navigation.push(OobeStackComponents.oobeServerScreen, {location: selectedLocation});
    } finally {
      setBusy(false);
    }
  };

  const cardsDisabled = busy || !currentSession;

  const onBackPress = () => {
    navigation.goBack();
  };

  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <View style={screenStyles.titleContainer}>
          <Text style={styles.text} variant={'headlineMedium'}>
            Select your location:
          </Text>
        </View>
        <View style={screenStyles.section}>
          <OobeLocationCard
            title={'On Land'}
            description={
              "The cruise hasn't sailed yet. You're probably still packing, or having dreams of forgetting that extra cosplay you made."
            }
            image={fromAsset(preregistration, 'preregistration.jpg')}
            selected={selectedLocation === OobeLocation.land}
            onPress={() => setSelectedLocation(OobeLocation.land)}
            disabled={cardsDisabled}
            testID={'oobeLocationLand-card'}
          />
        </View>
        <View style={screenStyles.section}>
          <OobeLocationCard
            title={'On Ship'}
            description={
              "You're here! Standing on the ship, connected to ship WiFi, ready to sail. Or maybe you're already at sea."
            }
            image={fromAsset(mainviewDay, 'mainview_day.jpg')}
            selected={selectedLocation === OobeLocation.ship}
            onPress={() => setSelectedLocation(OobeLocation.ship)}
            disabled={cardsDisabled}
            testID={'oobeLocationShip-card'}
          />
        </View>
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={onBackPress}
        rightOnPress={onNextPress}
        rightDisabled={!selectedLocation || cardsDisabled}
      />
    </AppView>
  );
};
