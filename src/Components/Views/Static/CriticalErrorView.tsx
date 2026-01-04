import {CacheManager} from '@georstat/react-native-image-cache';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {BoldText} from '#src/Components/Text/BoldText';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {defaultAppConfig} from '#src/Libraries/AppConfig';

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
  const {signOut} = useAuth();
  const {updateAppConfig} = useConfig();
  const {preRegistrationMode} = usePreRegistration();

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

  const fixAll = async () => {
    await signOut(preRegistrationMode);
    queryClient.clear();
    updateAppConfig(defaultAppConfig);
    props.resetError();
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
            buttonText={'Clear Image Cache'}
            onPress={async () => await CacheManager.clearCache()}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Sign Out'}
            onPress={async () => await signOut(preRegistrationMode)}
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
            buttonColor={theme.colors.twitarrPositiveButton}
            buttonText={'Fix it All'}
            onPress={fixAll}
          />
        </PaddedContentView>
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
