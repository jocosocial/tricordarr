import {useBackHandler} from '@react-native-community/hooks';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {Item} from 'react-navigation-header-buttons';

import {HeaderBackButton} from '#src/Components/Buttons/HeaderButtons/HeaderBackButton';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {SiteUIScreenActionsMenu} from '#src/Components/Menus/SiteUI/SiteUIScreenActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppIcons} from '#src/Enums/Icons';
import {isIOS} from '#src/Libraries/Platform/Detection';
import {useCommonStack} from '#src/Navigation/CommonScreens';

interface Props {
  initialUrl: string;
  initialKey?: string;
}

export const SiteUIScreenBase = ({initialUrl, initialKey = ''}: Props) => {
  const {serverUrl} = useSwiftarrQueryClient();
  const [webviewUrl, setWebviewUrl] = React.useState(initialUrl);
  const webViewRef = useRef<WebView>(null);
  const currentUrlRef = useRef<string>(initialUrl);
  const [key, setKey] = useState(initialKey);
  const [handleGoBack, setHandleGoBack] = useState(false);
  const navigation = useCommonStack();
  const {commonStyles} = useStyles();

  const onHome = useCallback(() => {
    setWebviewUrl(serverUrl);
    currentUrlRef.current = serverUrl;
    setKey(String(Date.now()));
  }, [serverUrl]);

  const reload = () => webViewRef.current?.reload();

  const getCurrentUrl = useCallback(() => currentUrlRef.current, []);

  /**
   * This overrides the back button to navigate in the Webview first if possible,
   * then hook into the navigation system to go back in the app.
   */
  const handleBackButtonPress = useCallback(() => {
    if (!handleGoBack) {
      navigation.goBack();
      return true;
    }
    // If we're at the Today screen (server URL with no path), navigate back in app
    const currentUrl = currentUrlRef.current;
    const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    const normalizedCurrentUrl = currentUrl.endsWith('/') ? currentUrl.slice(0, -1) : currentUrl;
    if (normalizedCurrentUrl === baseUrl) {
      navigation.goBack();
      return true;
    }
    try {
      webViewRef.current?.goBack();
      return true;
    } catch (err) {
      return false;
    }
  }, [navigation, handleGoBack, serverUrl]);

  const getNavBarIcons = useCallback(
    () => (
      <View>
        <MaterialHeaderButtons>
          <Item title={'Reload'} iconName={AppIcons.reload} onPress={reload} />
          <SiteUIScreenActionsMenu onHome={onHome} getCurrentUrl={getCurrentUrl} />
        </MaterialHeaderButtons>
      </View>
    ),
    [onHome, getCurrentUrl],
  );

  /**
   * An initial iteration of this feature hooked into the navigation system and would
   * override the default back button. This didn't work on iOS because the previous
   * screen title was in the header and it didn't work. So this replaces the button.
   *
   * On iOS the button is subtly different than the default. I don't think it's enough
   * to worry about fixing.
   */
  const getBackButton = useCallback(() => {
    return (
      <MaterialHeaderButtons style={commonStyles.headerLeftWrapper}>
        <HeaderBackButton onPress={handleBackButtonPress} />
      </MaterialHeaderButtons>
    );
  }, [handleBackButtonPress, commonStyles.headerLeftWrapper]);

  const handleWebViewNavigationStateChange = (newNavState: WebViewNavigation) => {
    const {canGoBack, url} = newNavState;
    console.log(`[SiteUIScreenBase.tsx] webview navigating to ${url}`);
    setHandleGoBack(canGoBack);
    currentUrlRef.current = url;
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavBarIcons,
      headerLeft: getBackButton,
    });
  }, [getNavBarIcons, getBackButton, navigation]);

  useBackHandler(() => {
    // This means we're gonna go back in the WebView, not in app.
    if (handleGoBack) {
      return handleBackButtonPress();
    }
    // Let the default thing happen, which is back in the app.
    return false;
  });

  return (
    <AppView disablePreRegistrationWarning={true}>
      <WebView
        source={{uri: webviewUrl}}
        key={key}
        ref={webViewRef}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        sharedCookiesEnabled={isIOS}
      />
    </AppView>
  );
};
