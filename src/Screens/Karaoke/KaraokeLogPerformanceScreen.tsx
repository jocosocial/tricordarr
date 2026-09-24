import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {useKaraokeLogPerformanceMutation} from '#src/Queries/Karaoke/KaraokeMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {MaintenanceModeScreen} from '#src/Screens/Checkpoint/MaintenanceModeScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {NoteCreateData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.karaokeLogPerformanceScreen>;

/**
 * Pure write action (logs a performance under the current user), so this stays behind
 * LoggedInScreen even though the rest of Karaoke is viewable while logged out.
 */
export const KaraokeLogPerformanceScreen = (props: Props) => {
  return (
    <MaintenanceModeScreen>
      <LoggedInScreen>
        <PreRegistrationScreen helpScreen={CommonStackComponents.karaokeHelpScreen}>
          <DisabledFeatureScreen feature={SwiftarrFeature.karaoke} urlPath={'/karaoke/log'}>
            <KaraokeLogPerformanceScreenInner {...props} />
          </DisabledFeatureScreen>
        </PreRegistrationScreen>
      </LoggedInScreen>
    </MaintenanceModeScreen>
  );
};

const KaraokeLogPerformanceScreenInner = ({navigation, route}: Props) => {
  const {songID, artist, songName} = route.params;
  const {commonStyles} = useStyles();
  const [performers, setPerformers] = useState('');
  const logMutation = useKaraokeLogPerformanceMutation();

  const submit = useCallback(() => {
    const trimmed = performers.trim();
    if (!trimmed) return;
    const note: NoteCreateData = {note: trimmed};
    logMutation.mutate(
      {songID, note},
      {
        onSuccess: () => {
          navigation.goBack();
        },
      },
    );
  }, [performers, songID, logMutation, navigation]);

  const styles = StyleSheet.create({
    section: {
      ...commonStyles.marginBottomMedium,
    },
    label: {
      ...commonStyles.marginBottomSmall,
    },
  });

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView style={styles.section}>
          <Text style={styles.label}>
            {artist} – {songName}
          </Text>
        </PaddedContentView>
        <PaddedContentView style={styles.section}>
          <Text style={styles.label}>Performers</Text>
          <TextInput
            mode={'outlined'}
            value={performers}
            onChangeText={setPerformers}
            placeholder={'Who performed?'}
            maxLength={500}
          />
        </PaddedContentView>
        <PaddedContentView>
          <Button mode={'contained'} onPress={submit} loading={logMutation.isPending} disabled={!performers.trim()}>
            Create Log Entry
          </Button>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
