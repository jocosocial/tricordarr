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
import {useReloadBoardgamesMutation} from '#src/Queries/Admin/SeedMutations';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

export const AdminBoardgamesScreen = () => {
  return (
    <AdminAccessScreen minAccess={'admin'}>
      <AdminBoardgamesScreenInner />
    </AdminAccessScreen>
  );
};

const AdminBoardgamesScreenInner = () => {
  const mutation = useReloadBoardgamesMutation();
  const {setSnackbarPayload} = useSnackbar();
  const {theme} = useAppTheme();
  useAdminHelpButton();

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView padTop={true}>
          <Text>Reload the board game catalog from the server seed files. Existing catalog data is replaced.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'boardgameReload-button'}
            buttonText={'Reload Board Game Catalog'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() =>
              alertReloadSeed('board games', () =>
                mutation.mutate(undefined, {
                  onSuccess: () => {
                    setSnackbarPayload({message: 'Board game catalog reloaded.', messageType: 'success'});
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
