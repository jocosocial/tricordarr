import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {Portal, useTheme} from 'react-native-paper';
import {commonStyles} from '../../styles';
import {ErrorSnackbar} from '../ErrorHandlers/ErrorSnackbar';
import {ErrorBanner} from '../ErrorHandlers/ErrorBanner';
import {AppModal} from '../Modals/AppModal';
// import {PrivilegeProvider} from '../Context/Providers/PrivilegeProvider';

type AppViewProps = PropsWithChildren<{
  // usePrivilege?: boolean;
}>;

/**
 * Highest level View container that contains app-specific components that
 * can be utilized by all children. For example, error messages.
 */
export const AppView = ({children}: AppViewProps) => {
  const theme = useTheme();

  const style = {
    backgroundColor: theme.colors.background,
    ...commonStyles.flex,
  };

  // We can thank ChatGPT for this idea. This enables providers to be dynamically included
  // in whatever view we are rendering. The order here will probably matter at some point.
  // let renderedChildren = children;
  // if (usePrivilege) {
  //   renderedChildren = <PrivilegeProvider>{children}</PrivilegeProvider>;
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
