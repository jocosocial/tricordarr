import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {BoldText} from '#src/Components/Text/BoldText';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useClipboard} from '#src/Hooks/useClipboard';
import {defaultAppConfig} from '#src/Libraries/AppConfig';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';

interface CriticalErrorViewProps {
  error: Error;
  resetError: Function;
}

/**
 * This is a standalone view that can be used to display a critical error.
 * It is not part of the navigation stack and can be used to display a critical error
 * in a standalone context. Thus it cannot rely on AppView.
 */
export const CriticalErrorView = (props: CriticalErrorViewProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const queryClient = useQueryClient();
  const [showStack, setShowStack] = React.useState(false);
  const [showSessions, setShowSessions] = React.useState(false);
  const [sessionsJson, setSessionsJson] = React.useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = React.useState(false);
  const {signOut, clearAllSessions} = useSession();
  const {updateAppConfig} = useConfig();
  const {setString: copyToClipboard} = useClipboard();

  const styles = StyleSheet.create({
    screen: {
      ...commonStyles.flex,
      ...commonStyles.safePaddingTop,
      ...commonStyles.safePaddingBottom,
    },
    outerContainer: {
      ...commonStyles.flex,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
    },
    innerContainer: {
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
    },
    contentContainer: {
      ...commonStyles.marginVerticalSmall,
    },
  });

  const toggleShowStack = () => setShowStack(!showStack);

  const toggleShowSessions = async () => {
    if (showSessions) {
      setShowSessions(false);
      setSessionsJson(null);
      return;
    }
    setIsLoadingSessions(true);
    try {
      const [sessions, lastSessionID] = await Promise.all([SessionStorage.getAll(), SessionStorage.getLastSessionID()]);
      setSessionsJson(
        JSON.stringify(
          {
            lastSessionID,
            sessions,
          },
          null,
          2,
        ),
      );
      setShowSessions(true);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const copySessionsToClipboard = () => {
    if (sessionsJson) {
      copyToClipboard(sessionsJson);
    }
  };

  const resetAppConfig = async () => {
    updateAppConfig(defaultAppConfig);
  };

  return (
    <View style={styles.screen}>
      <ScrollingContentView isStack={true} overScroll={true}>
        <View style={styles.outerContainer}>
          <PaddedContentView style={styles.innerContainer}>
            <View style={styles.contentContainer}>
              <AppIcon icon={AppIcons.error} size={150} onLongPress={toggleShowStack} />
            </View>
          </PaddedContentView>
        </View>
        <HelpTopicView>It's not you, it's me. Something has gone very wrong with this app.</HelpTopicView>
        <HelpTopicView title={'Name'}>{props.error.name}</HelpTopicView>
        <HelpTopicView title={'Message'}>{props.error.message}</HelpTopicView>
        <HelpTopicView>You can try to recover using the buttons below.</HelpTopicView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNeutralButton}
            buttonText={'Reload'}
            onPress={() => props.resetError()}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Clear Query Cache'}
            onPress={() => queryClient.clear()}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Sign Out'}
            onPress={async () => await signOut()}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Clear Sessions'}
            onPress={async () => await clearAllSessions()}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Reset Config'}
            onPress={resetAppConfig}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNeutralButton}
            buttonText={'Show Sessions'}
            onPress={toggleShowSessions}
            isLoading={isLoadingSessions}
          />
        </PaddedContentView>
        {showSessions && sessionsJson !== null && (
          <PaddedContentView>
            <BoldText>Sessions:</BoldText>
            <Pressable onLongPress={copySessionsToClipboard}>
              <Text variant={'labelSmall'} selectable={true}>
                {sessionsJson}
              </Text>
            </Pressable>
          </PaddedContentView>
        )}
        {showStack && (
          <PaddedContentView>
            <BoldText>Stack Trace:</BoldText>
            <Text variant={'labelSmall'} selectable={true}>
              {props.error.stack}
            </Text>
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </View>
  );
};
