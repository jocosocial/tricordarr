import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';
import {HeaderHeightContext} from '@react-navigation/elements';
import {useFocusEffect} from '@react-navigation/native';
import React, {PropsWithChildren, useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {Portal} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ErrorBanner} from '#src/Components/Banners/ErrorBanner';
import {AppSnackbar} from '#src/Components/Snackbars/AppSnackbar';
import {ConnectionDisruptedWarningView} from '#src/Components/Views/Warnings/ConnectionDisruptedWarningView';
import {MinAccessLevelWarningView} from '#src/Components/Views/Warnings/MinAccessLevelWarningView';
import {PreRegistrationWarningView} from '#src/Components/Views/Warnings/PreRegistrationWarningView';
import {UnsavedChangesWarningView} from '#src/Components/Views/Warnings/UnsavedChangesWarningView';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useLayout} from '#src/Context/Contexts/LayoutContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('AppView.tsx');

interface AppViewProps extends PropsWithChildren {
  disablePreRegistrationWarning?: boolean;
  disableMinAccessLevelWarning?: boolean;
}

/**
 * Highest level View container that contains app-specific components that
 * can be utilized by all children. For example, error messages.
 *
 * This used to also own a global KeyboardAvoidingView wrapping every screen —
 * see issue #573. That caused more problems than it solved (a one-size offset
 * heuristic, double keyboard compensation on form screens, and a scroll-correction
 * loop in ConversationListV2 fighting the KAV's relayout). Keyboard handling is
 * now per-surface: ScrollingContentView uses KeyboardAwareScrollView for forms,
 * and chat screens use KeyboardAwareLegendList + KeyboardStickyView.
 */
export const AppView = ({
  children,
  disablePreRegistrationWarning = false,
  disableMinAccessLevelWarning = false,
}: AppViewProps) => {
  const {commonStyles} = useStyles();
  const {disruptionDetected} = useSwiftarrQueryClient();
  const {hasUnsavedWork} = useErrorHandler();
  // https://reactnavigation.org/docs/6.x/handling-safe-area
  const insets = useSafeAreaInsets();
  const {preRegistrationMode} = usePreRegistration();
  const {headerHeight} = useLayout();
  // Raw context (not useHeaderHeight / useBottomTabBarHeight) because those hooks throw
  // when the provider is absent. Falsy/zero header height means no header above this
  // screen; undefined tab bar height means we are not inside a tab navigator.
  const navHeaderHeight = React.useContext(HeaderHeightContext);
  const tabBarHeight = React.useContext(BottomTabBarHeightContext);

  const styles = StyleSheet.create({
    appView: {
      ...commonStyles.background,
      ...commonStyles.flex,
      // This does not use commonStyles.safePaddingTop/safePaddingBottom etc because
      // those insets changing trigger re-renders.
      ...(!navHeaderHeight ? {paddingTop: insets.top} : undefined),
      ...(!tabBarHeight ? {paddingBottom: insets.bottom} : undefined),
    },
  });

  /**
   * Any time a screen is focused, set the header height. The value includes any
   * safe area insets since thats handled by React Navigation.
   * CallOverlay (outside the navigator tree) still reads this measured height.
   */
  useFocusEffect(
    useCallback(() => {
      logger.debug('useFocusEffect setting headerHeight', navHeaderHeight);
      headerHeight.set(navHeaderHeight ?? 0);
    }, [navHeaderHeight, headerHeight]),
  );

  return (
    <View style={styles.appView}>
      {/* Paper's Portal teleports to the PortalHost mounted in NavigationProvider, which
          sits above KeyboardProvider in App.tsx — this renders outside any keyboard
          handling regardless of where it's placed here. */}
      <Portal>
        <ErrorBanner />
        <AppSnackbar />
      </Portal>
      {preRegistrationMode && !disablePreRegistrationWarning && <PreRegistrationWarningView />}
      {!disableMinAccessLevelWarning && <MinAccessLevelWarningView />}
      {disruptionDetected && <ConnectionDisruptedWarningView />}
      {children}
      <UnsavedChangesWarningView isVisible={hasUnsavedWork} />
    </View>
  );
};
