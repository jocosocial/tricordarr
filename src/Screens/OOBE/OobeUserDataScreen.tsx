import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeUserDataScreen>;

export const OobeUserDataScreen = ({navigation}: Props) => {
  const {theme} = useAppTheme();

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>
            You can optionally fill out a user profile that is visible to other Twitarr users. Would you like to do this
            now? All fields are optional. You can always do it later or not at all.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonText={'Setup Profile'}
            buttonColor={theme.colors.twitarrNeutralButton}
            onPress={() => navigation.push(CommonStackComponents.userSelfProfileScreen)}
          />
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightText={'Next'}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeFinishScreen)}
      />
    </AppView>
  );
};
