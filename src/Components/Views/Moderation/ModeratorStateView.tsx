import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Menu, Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {useMenu} from '#src/Hooks/useMenu';
import {useModerationContentActions} from '#src/Hooks/useModerationContentActions';
import {ModeratedContentData, ModerationStateContext} from '#src/Libraries/Moderation';

interface ModeratorStateViewProps {
  data: ModeratedContentData;
}

/**
 * Current moderation status and Set State menu for a piece of content.
 */
export const ModeratorStateView = ({data}: ModeratorStateViewProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const context = useMemo(() => ModerationStateContext.fromData(data), [data]);
  const actions = useModerationContentActions(context.cacheKeys);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          ...commonStyles.flexColumn,
          ...commonStyles.gapSmall,
        },
      }),
    [commonStyles],
  );

  return (
    <View style={styles.container}>
      <Text>Current State: {ContentModerationStatus.getLabel(data.moderationStatus)}</Text>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <PrimaryActionButton
            testID={'moderationSetState-button'}
            buttonText={'Set State'}
            buttonColor={theme.colors.twitarrNeutralButton}
            disabled={context.isDeleted || actions.isLoading}
            isLoading={actions.isLoading}
            onPress={openMenu}
          />
        }>
        {ContentModerationStatus.settableStates.map(state => (
          <Menu.Item
            key={state}
            dense={false}
            title={ContentModerationStatus.getActionLabel(state)}
            disabled={state === data.moderationStatus}
            onPress={() => {
              closeMenu();
              actions.setState(context.path, context.contentID, state);
            }}
          />
        ))}
      </Menu>
    </View>
  );
};
