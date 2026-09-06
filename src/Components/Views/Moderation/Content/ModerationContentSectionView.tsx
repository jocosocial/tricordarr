import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface ModerationContentSectionViewProps extends PropsWithChildren {
  onViewInContext: () => void;
  testIDPrefix: string;
  disabled?: boolean;
}

/**
 * Content section on a content moderate screen: preview, then View in Context.
 */
export const ModerationContentSectionView = ({
  onViewInContext,
  testIDPrefix,
  disabled,
  children,
}: ModerationContentSectionViewProps) => {
  const {theme} = useAppTheme();

  return (
    <View>
      <ListSection>
        <ListSubheader>Content</ListSubheader>
      </ListSection>
      {children}
      <PaddedContentView>
        <PrimaryActionButton
          testID={`${testIDPrefix}View-button`}
          buttonText={'View in Context'}
          buttonColor={theme.colors.twitarrNeutralButton}
          disabled={disabled}
          onPress={onViewInContext}
        />
      </PaddedContentView>
    </View>
  );
};
