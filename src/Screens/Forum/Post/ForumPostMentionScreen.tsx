import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {PrivilegedAccountButtons} from '#src/Components/Buttons/SegmentedButtons/PrivilegedAccountButtons';
import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ElevationProvider} from '#src/Context/Providers/ElevationProvider';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/Forum/ForumStackComponents';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';

type Props = StackScreenProps<ForumStackParamList, ForumStackComponents.forumPostMentionScreen>;

export const ForumPostMentionScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.forumPostMentionHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={'/forumpost/mentions'}>
          <ElevationProvider
            key={props.route.params?.asPrivilegedUser ?? 'self'}
            initialElevation={props.route.params?.asPrivilegedUser}>
            <ForumPostMentionScreenInner />
          </ElevationProvider>
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

/**
 * Mention list with optional Moderator / TwitarrTeam inbox switching.
 */
const ForumPostMentionScreenInner = () => {
  const {hasTwitarrTeam, hasModerator} = usePrivilege();
  const {asPrivilegedUser} = useElevation();
  const {currentUserID} = useSession();
  const {commonStyles} = useStyles();
  const {data: userNotificationData} = useUserNotificationDataQuery();
  const [userSwitchScrollToTopIntent, setUserSwitchScrollToTopIntent] = useState<number | undefined>(undefined);
  const prevAsPrivilegedUserRef = useRef(asPrivilegedUser);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        accountButtons: {
          ...commonStyles.paddingSmall,
        },
      }),
    [commonStyles.paddingSmall],
  );

  useEffect(() => {
    if (prevAsPrivilegedUserRef.current !== asPrivilegedUser) {
      prevAsPrivilegedUserRef.current = asPrivilegedUser;
      setUserSwitchScrollToTopIntent(Date.now());
    }
  }, [asPrivilegedUser]);

  const queryParams = asPrivilegedUser ? {mentionname: asPrivilegedUser} : {mentionself: true};

  const header =
    currentUserID != null && (hasTwitarrTeam || hasModerator) ? (
      <View style={styles.accountButtons}>
        <PrivilegedAccountButtons
          selfNotificationCount={userNotificationData?.newForumMentionCount}
          moderatorNotificationCount={userNotificationData?.moderatorData?.newModeratorForumMentionCount}
          twitarrTeamNotificationCount={userNotificationData?.moderatorData?.newTTForumMentionCount}
          testIDPrefix={'forumMentionAccount'}
        />
      </View>
    ) : undefined;

  return (
    <ForumPostScreenBase
      refreshOnUserNotification={true}
      queryParams={queryParams}
      header={header}
      scrollToTopIntent={userSwitchScrollToTopIntent}
      helpScreen={CommonStackComponents.forumPostMentionHelpScreen}
    />
  );
};
