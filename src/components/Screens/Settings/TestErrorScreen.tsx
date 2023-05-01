import React from 'react';
import {Text} from 'react-native-paper';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../styles/Theme';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {AppView} from '../../Views/AppView';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

export const TestErrorScreen = () => {
  const theme = useAppTheme();
  const {setErrorMessage, setErrorBanner, errorBanner, errorMessage} = useErrorHandler();

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>Banner: {errorBanner}</Text>
          <PrimaryActionButton
            buttonText="Banner"
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => setErrorBanner('This is a banner error.')}
          />
          <Text>Snackbar: {errorMessage}</Text>
          <PrimaryActionButton
            buttonText="Snackbar"
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => setErrorMessage('This is a snackbar error.')}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
