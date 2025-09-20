import React, {useState} from 'react';
import {Text} from 'react-native-paper';
import {PrimaryActionButton} from '#src/Buttons/PrimaryActionButton.tsx';
import {useAppTheme} from '../../../../Styles/Theme.ts';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {AppView} from '#src/Views/AppView.tsx';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext.ts';
import {useStyles} from '#src/Context/Contexts/StyleContext.ts';
import {useModal} from '#src/Context/Contexts/ModalContext.ts';
import {HelpModalView} from '#src/Views/Modals/HelpModalView.tsx';
import {RefreshControl} from 'react-native';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext.ts';
import {useHealthQuery} from '#src/Queries/Client/ClientQueries.ts';
import {useOpenQuery} from '#src/Queries/OpenQuery.ts';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext.ts';
import {BaseFABGroup} from '#src/Buttons/FloatingActionButtons/BaseFABGroup.tsx';

export const TestErrorScreen = () => {
  const theme = useAppTheme();
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
        refreshControl={<RefreshControl refreshing={isFetchingError || isFetchingSuccess} enabled={false} />}>
        <PaddedContentView>
          <Text>Banner: {errorBanner}</Text>
          <PrimaryActionButton
            buttonText="Banner"
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => setErrorBanner('This is a banner error.')}
            style={[commonStyles.marginTopSmall]}
          />
          <Text>Snackbar: {snackbarPayload?.message}</Text>
          <PrimaryActionButton
            buttonText="Snackbar"
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
