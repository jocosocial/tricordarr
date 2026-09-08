import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {UserAboutCard} from '#src/Components/Cards/UserProfile/UserAboutCard';
import {UserProfileCard} from '#src/Components/Cards/UserProfile/UserProfileCard';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {UserProfileAvatar} from '#src/Components/Views/UserProfileAvatar';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SetRefreshing} from '#src/Hooks/useRefresh';
import {ProfilePublicData} from '#src/Structs/ControllerStructs';

interface UserProfileViewProps {
  user: ProfilePublicData;
  setRefreshing: SetRefreshing;
}

/**
 * Public profile body: status message, avatar, byline, profile fields, and about.
 * Screen chrome (notes, content links, mute/block, FABs) stays with the caller.
 */
export const UserProfileView = ({user, setRefreshing}: UserProfileViewProps) => {
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        listContentCenter: {
          ...commonStyles.flexRow,
          ...commonStyles.justifyCenter,
        },
        titleText: {
          ...commonStyles.textCenter,
        },
      }),
    [commonStyles],
  );

  return (
    <View>
      {user.message && (
        <PaddedContentView padTop={true} padBottom={false} style={styles.listContentCenter}>
          <Text selectable={true}>{user.message}</Text>
        </PaddedContentView>
      )}
      <PaddedContentView padTop={true} style={styles.listContentCenter}>
        <UserProfileAvatar user={user} setRefreshing={setRefreshing} />
      </PaddedContentView>
      <PaddedContentView>
        <UserBylineTag user={user.header} includePronoun={false} variant={'headlineMedium'} style={styles.titleText} />
      </PaddedContentView>
      <PaddedContentView>
        <UserProfileCard user={user} />
      </PaddedContentView>
      {user.about && (
        <PaddedContentView>
          <UserAboutCard user={user} />
        </PaddedContentView>
      )}
    </View>
  );
};
