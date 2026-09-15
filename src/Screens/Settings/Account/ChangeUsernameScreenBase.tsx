import {FormikHelpers} from 'formik';
import React, {PropsWithChildren, useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ChangeUsernameForm} from '#src/Components/Forms/User/ChangeUsernameForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppIcons} from '#src/Enums/Icons';
import {HelpScreenComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ChangeUsernameFormValues} from '#src/Types/FormValues';

interface ChangeUsernameScreenBaseProps extends PropsWithChildren {
  currentUsername: string;
  onSubmit: (values: ChangeUsernameFormValues, helpers: FormikHelpers<ChangeUsernameFormValues>) => void;
  helpScreen?: HelpScreenComponents;
}

/**
 * Shared layout for changing a username: current user and server, extra copy, then the form.
 */
export const ChangeUsernameScreenBase = ({
  currentUsername,
  onSubmit,
  helpScreen,
  children,
}: ChangeUsernameScreenBaseProps) => {
  const navigation = useCommonStack();
  const {serverUrl} = useSwiftarrQueryClient();

  const getNavButtons = useCallback(() => {
    if (helpScreen === undefined) {
      return undefined;
    }
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => (navigation.push as (name: HelpScreenComponents) => void)(helpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [helpScreen, navigation]);

  useEffect(() => {
    if (helpScreen === undefined) {
      return;
    }
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, helpScreen, navigation]);

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>
            Changing username for user {currentUsername} on server {serverUrl}.
          </Text>
        </PaddedContentView>
        {children}
        <PaddedContentView>
          <ChangeUsernameForm onSubmit={onSubmit} initialValues={{username: currentUsername}} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
