import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface ModerationUserAlternateAccountsSectionViewProps {
  accounts: UserHeader[];
}

/**
 * Alternate-accounts section on the user moderate screen. Each row opens that account's moderate screen.
 */
export const ModerationUserAlternateAccountsSectionView = ({
  accounts,
}: ModerationUserAlternateAccountsSectionViewProps) => {
  const navigation = useCommonStack();

  return (
    <View>
      <ListSection>
        <ListSubheader>Alternate Accounts</ListSubheader>
      </ListSection>
      {accounts.length === 0 ? (
        <PaddedContentView padTop={true}>
          <Text>No alternate accounts.</Text>
        </PaddedContentView>
      ) : (
        accounts.map(account => (
          <UserListItem
            key={account.userID}
            userHeader={account}
            onPress={() => navigation.push(CommonStackComponents.moderateUserScreen, {id: account.userID})}
          />
        ))
      )}
    </View>
  );
};
