import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import React from 'react';
import {Text} from 'react-native-paper';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeWelcomeScreen, NavigatorIDs.oobeStack>;

export const OobeWelcomeScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();

  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <Text>Welcome</Text>
        {/*<PrimaryActionButton buttonText={'Finish'} onPress={onFinish} />*/}
        <PrimaryActionButton
          buttonText={'Next'}
          onPress={() => navigation.push(OobeStackComponents.oobeServerScreen)}
        />
      </ScrollingContentView>
    </AppView>
  );
};
