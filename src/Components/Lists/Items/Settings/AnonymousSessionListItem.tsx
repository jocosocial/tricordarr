import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {ListItem} from '#src/Components/Lists/ListItem';
import {AnonymousSessionActionsMenu} from '#src/Components/Menus/AnonymousSessionActionsMenu';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {anonymousSessionName, isServerPreRegistration} from '#src/Libraries/Account';
import {serverUrlHost} from '#src/Libraries/ServerUrl';
import {Session} from '#src/Structs/SessionStructs';

interface AnonymousSessionListItemProps {
  session: Session;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * An anonymous session in the Accounts list, styled like an account row so the two sort together.
 * Tapping switches to it.
 */
export const AnonymousSessionListItem = ({session, onPress, disabled}: AnonymousSessionListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {currentSession, serverProfiles} = useSession();
  const isCurrent = currentSession?.sessionID === session.sessionID;
  const isPreRegistration = isServerPreRegistration(serverProfiles.find(p => p.serverUrl === session.serverUrl));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: isCurrent ? commonStyles.bold : {},
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
      <AvatarImage icon={AppIcons.anonymous} />
    </View>
  );

  const getRight = () => (
    <View style={styles.right}>
      {isPreRegistration && <AppIcon icon={AppIcons.preregistration} />}
      {isCurrent && <AppIcon icon={AppIcons.check} color={theme.colors.twitarrNeutralButton} />}
      <AnonymousSessionActionsMenu session={session} />
    </View>
  );

  return (
    <ListItem
      title={anonymousSessionName}
      titleStyle={styles.title}
      description={serverUrlHost(session.serverUrl)}
      left={getAvatar}
      right={getRight}
      onPress={onPress}
      disabled={disabled}
      testID={`anonymousSession-${session.sessionID}`}
    />
  );
};
