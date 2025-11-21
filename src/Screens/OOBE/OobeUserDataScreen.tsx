import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeUserDataScreen>;

export const OobeUserDataScreen = ({navigation}: Props) => {
  const {tokenData} = useAuth();
  const {theme} = useAppTheme();
  const {preRegistrationMode} = useConfig();

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
            onPress={() => {
              if (tokenData) {
                navigation.push(CommonStackComponents.userProfileScreen, {
                  userID: tokenData?.userID,
                  enableContent: false,
                  oobe: true,
                });
              }
            }}
            disabled={!tokenData}
          />
        </PaddedContentView>
        {preRegistrationMode && (
          <>
            <PaddedContentView>
              <Text>
                You can optionally follow official and shadow events in the schedule. Would you like to do this now? You
                can always do it later or not at all. This will add them to your in-app day planner and generate
                reminder notifications. If you have simultaneous internet and Twitarr access you can also import from a
                Sched.com account.
              </Text>
            </PaddedContentView>
            <PaddedContentView>
              <Text>You are in pre-registration mode. The schedule may not be available yet.</Text>
            </PaddedContentView>

            <PaddedContentView>
              <PrimaryActionButton
                buttonText={'View Events'}
                buttonColor={theme.colors.twitarrNeutralButton}
                onPress={() => {
                  if (tokenData) {
                    navigation.push(OobeStackComponents.oobeScheduleDayScreen);
                  }
                }}
                disabled={!tokenData}
              />
            </PaddedContentView>
          </>
        )}
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightText={'Next'}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeFinishScreen)}
      />
    </AppView>
  );
};
