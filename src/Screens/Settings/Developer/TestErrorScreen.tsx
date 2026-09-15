import React, {useState} from 'react';
import {Alert} from 'react-native';
import {Text} from 'react-native-paper';

import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {createLogger} from '#src/Libraries/Logger';
import {useHealthQuery} from '#src/Queries/Client/ClientQueries';
import {useOpenQuery} from '#src/Queries/OpenQuery';

const logger = createLogger('TestErrorScreen.tsx');

export const TestErrorScreen = () => {
  const {theme} = useAppTheme();
  const {setErrorBanner, errorBanner} = useErrorHandler();
  const {snackbarPayload, setSnackbarPayload} = useSnackbar();
  const {commonStyles} = useStyles();
  const {refetch: refetchErrorQuery, isFetching: isFetchingError} = useOpenQuery('/nonexistant', {
    enabled: false,
  });
  const {errorCount} = useSwiftarrQueryClient();
  const {refetch: refetchSuccessQuery, isFetching: isFetchingSuccess} = useHealthQuery({
    enabled: false,
  });
  const [fault, setFault] = useState(false);

  const onAlert = () => {
    Alert.alert('Help', 'This is a test', [{text: 'OK', onPress: () => logger.info('Alert dismissed.')}]);
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
            testID={'banner-button'}
            buttonText={'Banner'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => setErrorBanner('This is a banner error.')}
            style={[commonStyles.marginTopSmall]}
          />
          <Text>Snackbar: {snackbarPayload?.message}</Text>
          <PrimaryActionButton
            testID={'snackbar-button'}
            buttonText={'Snackbar'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => setSnackbarPayload({message: 'This is a snackbar error.'})}
            style={[commonStyles.marginTopSmall]}
          />
          <Text>Alert</Text>
          <PrimaryActionButton
            testID={'alert-button'}
            buttonText={'Alert'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={onAlert}
            style={[commonStyles.marginTopSmall]}
          />
        </PaddedContentView>
        <PaddedContentView>
          <Text>{errorCount}</Text>
          <PrimaryActionButton
            testID={'failQuery-button'}
            buttonText={'Fail Query'}
            onPress={refetchErrorQuery}
            buttonColor={theme.colors.twitarrNegativeButton}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'successQuery-button'}
            buttonText={'Success Query'}
            onPress={refetchSuccessQuery}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'triggerCriticalFault-button'}
            buttonText={'Trigger Critical Fault'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={triggerCriticalFault}
          />
        </PaddedContentView>
      </ScrollingContentView>
      <BaseFABGroup testID={'testError-fab'} actions={[]} />
    </AppView>
  );
};
