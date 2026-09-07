import React from 'react';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface ModeratorEditUsernameButtonViewProps {
  userID: string;
  username?: string;
  disabled?: boolean;
}

/**
 * Navigates to the moderator change-username form from a profile moderate screen.
 */
export const ModeratorEditUsernameButtonView = ({userID, username, disabled}: ModeratorEditUsernameButtonViewProps) => {
  const navigation = useCommonStack();
  const {theme} = useAppTheme();

  /**
   * Open the Edit Username screen for this user.
   */
  const onPress = () => {
    if (!username) {
      return;
    }
    navigation.push(CommonStackComponents.moderateChangeUsernameScreen, {userID, username});
  };

  return (
    <PaddedContentView>
      <PrimaryActionButton
        testID={'profileModerateEditUsername-button'}
        buttonText={'Edit Username'}
        icon={AppIcons.edituser}
        buttonColor={theme.colors.twitarrNeutralButton}
        disabled={disabled || !username}
        onPress={onPress}
      />
    </PaddedContentView>
  );
};
