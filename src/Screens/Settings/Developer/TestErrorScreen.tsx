import React, {useState} from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpModalView} from '#src/Components/Views/Modals/HelpModalView';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useHealthQuery} from '#src/Queries/Client/ClientQueries';
import {useOpenQuery} from '#src/Queries/OpenQuery';

export const TestErrorScreen = () => {
  const {theme} = useAppTheme();
  const {setErrorBanner, errorBanner} = useErrorHandler();
  const {snackbarPayload, setSnackbarPayload} = useSnackbar();
  const {commonStyles} = useStyles();
  const {setModalContent, setModalVisible, setModalOnDismiss} = useModal();
  const {refetch: refetchErrorQuery, isFetching: isFetchingError} = useOpenQuery('/nonexistant', {
    enabled: false,
  });
  const {errorCount} = useSwiftarrQueryClient();
  const {refetch: refetchSuccessQuery, isFetching: isFetchingSuccess} = useHealthQuery({
    enabled: false,
  });
  const [fault, setFault] = useState(false);

  const onDismiss = () => console.log('[TestErrorScreen.tsx] Modal dismissed.');
  const onModal = () => {
    setModalContent(<HelpModalView text={'This is a test'} />);
    setModalVisible(true);
    setModalOnDismiss(onDismiss);
  };

  const triggerCriticalFault = () => setFault(true);

  if (fault) {
    throw Error('Critical Fault');
  }

  return (
    <AppView>
      <ScrollingContentView
        refreshControl={<AppRefreshControl refreshing={isFetchingError || isFetchingSuccess} enabled={false} />}>
        <PaddedContentView>
          <Text>Banner: {errorBanner}</Text>
          <PrimaryActionButton
            buttonText={'Banner'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => setErrorBanner('This is a banner error.')}
            style={[commonStyles.marginTopSmall]}
          />
          <Text>Snackbar: {snackbarPayload?.message}</Text>
          <PrimaryActionButton
            buttonText={'Snackbar'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => setSnackbarPayload({message: 'This is a snackbar error.'})}
            style={[commonStyles.marginTopSmall]}
          />
          <Text>Modal</Text>
          <PrimaryActionButton
            buttonText={'Modal'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={onModal}
            style={[commonStyles.marginTopSmall]}
          />
        </PaddedContentView>
        <PaddedContentView>
          <Text>{errorCount}</Text>
          <PrimaryActionButton
            buttonText={'Fail Query'}
            onPress={refetchErrorQuery}
            buttonColor={theme.colors.twitarrNegativeButton}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton buttonText={'Success Query'} onPress={refetchSuccessQuery} />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonText={'Trigger Critical Fault'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={triggerCriticalFault}
          />
        </PaddedContentView>
      </ScrollingContentView>
      <BaseFABGroup actions={[]} />
    </AppView>
  );
};
