import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {Portal, useTheme} from 'react-native-paper';
import {commonStyles} from '../../styles';
import {ErrorSnackbar} from '../ErrorHandlers/ErrorSnackbar';
import {ErrorBanner} from '../ErrorHandlers/ErrorBanner';
import {AppModal} from '../Modals/AppModal';

/**
 * Highest level View container that contains app-specific components that
 * can be utilized by all children. For example, error messages.
 */
export const AppView = ({children}: PropsWithChildren) => {
  const theme = useTheme();

  const style = {
    backgroundColor: theme.colors.background,
    ...commonStyles.flex,
  };

  // This has been shelved until some future time when it may matter.
  // We can thank ChatGPT for this idea. This enables providers to be dynamically included
  // in whatever view we are rendering. The order here will probably matter at some point.
  // let renderedChildren = children;
  // if (useUserRelations) {
  //   renderedChildren = <UserRelationsProvider>{children}</UserRelationsProvider>;
  // }

  return (
    <Portal.Host>
      <View style={style}>
        <Portal>
          <ErrorBanner />
          <AppModal />
          <ErrorSnackbar />
        </Portal>
        {children}
      </View>
    </Portal.Host>
  );
};
