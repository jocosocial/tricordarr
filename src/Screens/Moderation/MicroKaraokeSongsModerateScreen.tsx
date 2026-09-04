import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ListItem} from '#src/Components/Lists/ListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useMicroKaraokeModerationSongListQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.microKaraokeSongsModerateScreen>;

const MicroKaraokeSongsModerateScreenInner = () => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();
  const {data, refetch, isLoading} = useMicroKaraokeModerationSongListQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  useModerationHelpHeader();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        empty: {
          ...commonStyles.marginTopSmall,
        },
      }),
    [commonStyles],
  );

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {data.length === 0 ? (
          <PaddedContentView>
            <Text style={styles.empty}>No Micro Karaoke songs to review.</Text>
          </PaddedContentView>
        ) : (
          <View>
            <ListSection>
              {data.map(song => {
                let status = 'In progress';
                if (song.modApproved) {
                  status = 'Approved';
                } else if (song.completionTime) {
                  status = 'Complete, needs approval';
                }
                return (
                  <ListItem
                    key={String(song.songID)}
                    title={`${song.songName} — ${song.artistName}`}
                    description={status}
                    onPress={() =>
                      navigation.push(CommonStackComponents.microKaraokeSongModerateScreen, {
                        id: String(song.songID),
                      })
                    }
                  />
                );
              })}
            </ListSection>
          </View>
        )}
      </ScrollingContentView>
    </AppView>
  );
};

export const MicroKaraokeSongsModerateScreen = (_props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <MicroKaraokeSongsModerateScreenInner />
    </ModeratorFeatureScreen>
  );
};
