import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {Linking} from 'react-native';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationActionRow} from '#src/Components/Views/Moderation/ModerationActionRow';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertApproveMicroKaraokeSong, alertDeleteMicroKaraokeSnippet} from '#src/Libraries/Alerts/ModerationAlerts';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {invalidateQueryKeys} from '#src/Libraries/QueryInvalidation';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {
  useMicroKaraokeApproveSongMutation,
  useMicroKaraokeSnippetDeleteMutation,
} from '#src/Queries/Moderation/ModerationMutations';
import {
  useMicroKaraokeModerationSnippetsQuery,
  useMicroKaraokeModerationSongQuery,
} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {MicroKaraokeCompletedSong, ModeratorActionLogResponseData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.microKaraokeSongModerateScreen>;

const MicroKaraokeSongModerateScreenInner = ({route}: Props) => {
  const songID = Number.parseInt(route.params.id, 10);
  const navigation = useCommonStack();
  const queryClient = useQueryClient();
  const {setSnackbarPayload} = useSnackbar();
  const songQuery = useMicroKaraokeModerationSongQuery(songID);
  const snippetsQuery = useMicroKaraokeModerationSnippetsQuery(songID);
  const {refreshing, onRefresh} = useRefresh({
    refresh: async () => {
      await Promise.all([songQuery.refetch(), snippetsQuery.refetch()]);
    },
  });
  const deleteMutation = useMicroKaraokeSnippetDeleteMutation();
  const approveMutation = useMicroKaraokeApproveSongMutation();
  useModerationHelpHeader();

  const song = songQuery.data;
  const snippets = snippetsQuery.data;

  if (songQuery.isLoading || snippetsQuery.isLoading || !song || !snippets) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const invalidate = async () => {
    await invalidateQueryKeys(
      queryClient,
      MicroKaraokeCompletedSong.getModerationCacheKeys(songID).concat(ModeratorActionLogResponseData.getCacheKeys()),
    );
  };

  const onApprove = () => {
    alertApproveMicroKaraokeSong(() => {
      approveMutation.mutate(
        {songID},
        {
          onSuccess: async () => {
            await invalidate();
            setSnackbarPayload({message: 'Song approved.', messageType: 'info'});
          },
        },
      );
    });
  };

  const onDeleteSnippet = (snippetID: string) => {
    alertDeleteMicroKaraokeSnippet(() => {
      deleteMutation.mutate(
        {snippetID},
        {
          onSuccess: async () => {
            await invalidate();
            setSnackbarPayload({message: 'Clip deleted.', messageType: 'info'});
          },
        },
      );
    });
  };

  const canApprove = Boolean(song.completionTime) && !song.modApproved;

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <Text variant={'titleMedium'}>
            {song.songName} — {song.artistName}
          </Text>
          <Text>
            {song.modApproved
              ? 'Approved'
              : song.completionTime
                ? 'Complete, awaiting approval'
                : `In progress (${song.totalSnippetSlots} slots)`}
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <ModerationActionRow
            buttons={[
              {
                label: 'Approve',
                disabled: !canApprove || approveMutation.isPending,
                onPress: onApprove,
              },
            ]}
          />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Clips</ListSubheader>
        </ListSection>
        {snippets.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text>No clips for this song.</Text>
          </PaddedContentView>
        ) : (
          snippets.map(snippet => (
            <PaddedContentView key={snippet.snippetID} padTop={true}>
              <Text>Clip {snippet.snippetIndex + 1}</Text>
              <UserBylineTag
                user={snippet.user}
                onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: snippet.user.userID})}
              />
              <ModerationActionRow
                buttons={[
                  {
                    label: 'Watch',
                    disabled: !snippet.videoURL,
                    onPress: () => {
                      if (snippet.videoURL) {
                        Linking.openURL(snippet.videoURL);
                      }
                    },
                  },
                  {
                    label: 'Delete Clip',
                    disabled: !snippet.videoURL || deleteMutation.isPending,
                    onPress: () => onDeleteSnippet(snippet.snippetID),
                  },
                  {
                    label: 'Mod User',
                    onPress: () => pushModerateResource(navigation, 'user', snippet.user.userID),
                  },
                ]}
              />
            </PaddedContentView>
          ))
        )}
      </ScrollingContentView>
    </AppView>
  );
};

export const MicroKaraokeSongModerateScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <MicroKaraokeSongModerateScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
