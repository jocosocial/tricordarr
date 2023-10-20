import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import React from 'react';
import {Button, Card, Text} from 'react-native-paper';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {View} from 'react-native';
import {OobeButtonsView} from '../../Views/OobeButtonsView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {HeaderCard} from '../../Cards/MainScreen/HeaderCard';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeWelcomeScreen, NavigatorIDs.oobeStack>;

export const OobeWelcomeScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();

  return (
    // <View style={{backgroundColor: 'pink'}}>
    //   <View style={{backgroundColor: 'blue', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
    //     <Button mode={'contained'} style={{alignSelf: 'flex-start'}}>Previous</Button>
    //     <Button mode={'contained'} style={{alignSelf: 'flex-end'}}>Next</Button>
    //   </View>
    // </View>
    <AppView>
      {/*<View style={{backgroundColor: 'red', display: 'flex', flexGrow: 1, flexDirection: 'column'}}>*/}
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text style={{textAlign: 'center'}} variant={'displayLarge'}>
            Welcome to Twitarr!
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={{textAlign: 'center'}}>
            The on-board bespoke communication platform of the JoCo Cruise.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView
        // leftText={'Previous'}
        // leftOnPress={() => navigation.push(OobeStackComponents.oobeServerScreen)}
        rightText={'Next'}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeServerScreen)}
      />
    </AppView>
  );
};
