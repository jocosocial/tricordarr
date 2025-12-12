import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';

// @ts-ignore

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobePreregistrationScreen>;

export const OobePreregistrationScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {appConfig, updateAppConfig} = useConfig();

  const setPreRegistrationMode = useCallback(
    (mode: boolean) => {
      updateAppConfig({...appConfig, preRegistrationMode: mode});
    },
    [appConfig, updateAppConfig],
  );

  const styles = StyleSheet.create({
    text: commonStyles.textCenter,
    image: commonStyles.roundedBorderLarge,
  });

  const onPress = () => {
    setPreRegistrationMode(false);
    navigation.push(OobeStackComponents.oobeServerScreen);
  };

  const onBackPress = () => {
    setPreRegistrationMode(true);
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
          <Text style={styles.text}>Do not proceed until you are physically on the ship!</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={styles.text}>
            Ensure that your phone is in airplane mode, on ship WiFi, and you have disabled any VPNs, private DNS, or
            other network blockers.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView leftText={'Back'} leftOnPress={onBackPress} rightOnPress={onPress} />
    </AppView>
  );
};
