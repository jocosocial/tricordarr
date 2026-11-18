import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {Account} from '#src/Structs/SessionStructs';

interface SignedInAccountViewProps {
  account: Account;
  serverUrl: string;
}

/**
 * Confirms which account the setup flow is signed in to, so a user can tell the login did what they
 * meant before carrying on.
 */
export const SignedInAccountView = ({account, serverUrl}: SignedInAccountViewProps) => {
  const {commonStyles} = useStyles();

  return (
    <View>
      <View style={commonStyles.paddingBottomSmall}>
        <Text>
          Signed in as <Text style={commonStyles.bold}>{account.username || account.userID}</Text> on {serverUrl}.
        </Text>
      </View>
      <Text>
        Access level: {UserAccessLevel.getLabel(account.accessLevel)} (
        {UserAccessLevel.getDescription(account.accessLevel)})
      </Text>
    </View>
  );
};
