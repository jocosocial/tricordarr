import React from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../styles/Theme';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeRegisterScreen, NavigatorIDs.oobeStack>;

export const OobeRegisterScreen = ({navigation}: Props) => {
  const theme = useAppTheme();
  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text>Accounts are new every year. Only create an account if you have not done so this year.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton buttonText={'Create Account'} onPress={() => console.log('create')} />
        </PaddedContentView>
        <PaddedContentView>
          <Text>If you created an account during the pre-registration period or on a different device you can log in below.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton buttonColor={theme.colors.twitarrNeutralButton} buttonText={'Log In'} onPress={() => console.log('login')} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
