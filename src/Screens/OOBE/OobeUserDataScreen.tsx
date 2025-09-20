import {AppView} from '#src/Views/AppView.tsx';
import {OobeButtonsView} from '#src/Views/OobeButtonsView.tsx';
import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {Text} from 'react-native-paper';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {useAuth} from '#src/Context/Contexts/AuthContext.ts';
import {PrimaryActionButton} from '#src/Buttons/PrimaryActionButton.tsx';
import {CommonStackComponents} from '#src/Navigation/CommonScreens.tsx';
import {useAppTheme} from '../../../Styles/Theme.ts';
import {useConfig} from '#src/Context/Contexts/ConfigContext.ts';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeUserDataScreen>;

export const OobeUserDataScreen = ({navigation}: Props) => {
  const {tokenData} = useAuth();
  const theme = useAppTheme();
  const {preRegistrationMode} = useConfig();

  return (
    <AppView safeEdges={['bottom']}>
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
                    navigation.push(OobeStackComponents.oobeScheduleDayScreen, {
                      oobe: true,
                    });
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
