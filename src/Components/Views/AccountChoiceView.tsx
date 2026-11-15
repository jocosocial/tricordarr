import React from 'react';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface AccountChoiceViewProps {
  onCreate: () => void;
  onLogin: () => void;
  onProceed: () => void;
  /** Whether pre-registration applies to the server being chosen. Defaults to the active session's. */
  preRegistrationMode?: boolean;
  disabled?: boolean;
}

/**
 * The "create an account, log in, or proceed without one" choice, shared by the OOBE account step
 * and the add-account flow. It only offers the choice; what each option does is the caller's.
 */
export const AccountChoiceView = ({
  onCreate,
  onLogin,
  onProceed,
  preRegistrationMode,
  disabled,
}: AccountChoiceViewProps) => {
  const {theme} = useAppTheme();
  const {preRegistrationMode: sessionPreRegistrationMode} = usePreRegistration();
  const preRegistration = preRegistrationMode ?? sessionPreRegistrationMode;

  return (
    <ScrollingContentView isStack={false}>
      <PaddedContentView>
        <Text>Accounts are new every year. Only create an account if you have not done so this year.</Text>
      </PaddedContentView>
      {!preRegistration && (
        <PaddedContentView>
          <Text>
            If you created an account during pre-registration, you can instead log in with that account below.
          </Text>
        </PaddedContentView>
      )}
      <PaddedContentView>
        <PrimaryActionButton
          testID={'oobeCreateAccount-button'}
          buttonText={'Create Account'}
          onPress={onCreate}
          disabled={disabled}
        />
      </PaddedContentView>
      <PaddedContentView>
        <Text>
          If you already created an account this year (including during pre-registration) you can log in with it below.
        </Text>
      </PaddedContentView>
      <PaddedContentView>
        <PrimaryActionButton
          testID={'oobeLogIn-button'}
          buttonColor={theme.colors.twitarrNeutralButton}
          buttonText={'Log In'}
          onPress={onLogin}
          disabled={disabled}
        />
      </PaddedContentView>
      <PaddedContentView>
        <Text>You can also use some areas of Twitarr without creating an account now or ever.</Text>
      </PaddedContentView>
      <PaddedContentView>
        <PrimaryActionButton
          testID={'oobeProceedWithoutAccount-button'}
          buttonColor={theme.colors.twitarrNegativeButton}
          textColor={theme.colors.onTwitarrNegativeButton}
          buttonText={'Proceed Without an Account'}
          onPress={onProceed}
          disabled={disabled}
        />
      </PaddedContentView>
    </ScrollingContentView>
  );
};
