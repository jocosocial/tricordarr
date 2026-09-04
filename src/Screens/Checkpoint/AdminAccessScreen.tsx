import {PropsWithChildren} from 'react';
import {Text} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {AdminMinAccess, useAdminAccess} from '#src/Hooks/Admin/useAdminAccess';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';

interface AdminAccessScreenProps extends PropsWithChildren {
  minAccess: AdminMinAccess;
}

/**
 * Checkpoint that requires a minimum admin privilege. TwitarrTeam includes THO and Admin.
 * `accountmanager` also allows the Account Manager role (reg-code tools).
 */
export const AdminAccessScreen = ({children, minAccess}: AdminAccessScreenProps) => {
  return (
    <LoggedInScreen>
      <AdminAccessScreenInner minAccess={minAccess}>{children}</AdminAccessScreenInner>
    </LoggedInScreen>
  );
};

const AdminAccessScreenInner = ({children, minAccess}: AdminAccessScreenProps) => {
  const {hasMinAccess} = useAdminAccess();

  if (!hasMinAccess(minAccess)) {
    return (
      <AppView>
        <PaddedContentView padTop={true}>
          <Text>You do not have permission to use this admin function.</Text>
        </PaddedContentView>
      </AppView>
    );
  }

  return children;
};
