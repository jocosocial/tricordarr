import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {ListItem} from '#src/Components/Lists/ListItem';
import {AccountActionsMenu} from '#src/Components/Menus/AccountActionsMenu';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {accountName, accountStatusLabel, isAccountPreRegistration} from '#src/Libraries/Account';
import {serverUrlHost} from '#src/Libraries/ServerUrl';
import {Account} from '#src/Structs/SessionStructs';

interface AccountListItemProps {
  account: Account;
  onPress: () => void;
  disabled?: boolean;
  /** Show the sign out / remove menu. The switcher sheet leaves it to the Accounts screen. */
  showMenu?: boolean;
}

/**
 * One account in the Accounts list: avatar, username, server, a badge when the account is not
 * signed in, a check on the current account and optionally an actions menu. Tapping switches to
 * the account (or opens login for one that is signed out).
 */
export const AccountListItem = ({account, onPress, disabled, showMenu = true}: AccountListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {currentAccount, serverProfiles} = useSession();
  const isCurrent = currentAccount?.accountID === account.accountID;
  const statusLabel = accountStatusLabel(account);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: isCurrent ? commonStyles.bold : {},
        // Same left treatment as FezChatListItem so avatars and icons line up.
        avatar: {
          ...commonStyles.paddingLeftSmall,
          ...commonStyles.justifyCenter,
          ...commonStyles.alignItemsCenter,
        },
        right: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.justifyCenter,
        },
      }),
    [commonStyles, isCurrent],
  );

  const getAvatar = () => (
    <View style={styles.avatar}>
      <AvatarImage
        serverUrl={account.serverUrl}
        userHeader={{userID: account.userID, username: account.username, userImage: account.userImage}}
      />
    </View>
  );

  const getRight = () => (
    <View style={styles.right}>
      {statusLabel && <Text variant={'labelSmall'}>{statusLabel}</Text>}
      {isAccountPreRegistration(account, serverProfiles) && <AppIcon icon={AppIcons.preregistration} />}
      {isCurrent && <AppIcon icon={AppIcons.check} color={theme.colors.twitarrNeutralButton} />}
      {showMenu && <AccountActionsMenu account={account} />}
    </View>
  );

  return (
    <ListItem
      title={accountName(account)}
      titleStyle={styles.title}
      description={serverUrlHost(account.serverUrl)}
      left={getAvatar}
      right={getRight}
      onPress={onPress}
      disabled={disabled}
      testID={`account-${account.accountID}`}
    />
  );
};
