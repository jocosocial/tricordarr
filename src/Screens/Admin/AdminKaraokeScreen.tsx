import React from 'react';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {alertReloadSeed} from '#src/Libraries/Alerts/AdminAlerts';
import {useReloadKaraokeMutation} from '#src/Queries/Admin/SeedMutations';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

export const AdminKaraokeScreen = () => {
  return (
    <AdminAccessScreen minAccess={'admin'}>
      <AdminKaraokeScreenInner />
    </AdminAccessScreen>
  );
};

const AdminKaraokeScreenInner = () => {
  const mutation = useReloadKaraokeMutation();
  const {setSnackbarPayload} = useSnackbar();
  const {theme} = useAppTheme();
  useAdminHelpButton();

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView padTop={true}>
          <Text>
            Reload the karaoke song catalog from the server seed files. Existing catalog data is replaced. Logged
            performances are not removed.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'karaokeReload-button'}
            buttonText={'Reload Karaoke Catalog'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() =>
              alertReloadSeed('karaoke songs', () =>
                mutation.mutate(undefined, {
                  onSuccess: () => {
                    setSnackbarPayload({message: 'Karaoke catalog reloaded.', messageType: 'success'});
                  },
                }),
              )
            }
            isLoading={mutation.isPending}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
