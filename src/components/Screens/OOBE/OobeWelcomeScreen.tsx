import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import React from 'react';
import {Button, Text} from 'react-native-paper';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {View} from 'react-native';
import {OobeButtonsView} from '../../Views/OobeButtonsView';

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
        <Text>Welcome</Text>
        <Text>
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum."
          {/*"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"*/}
          {/*"But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"*/}
        </Text>
        {/*<PrimaryActionButton buttonText={'Finish'} onPress={onFinish} />*/}
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
