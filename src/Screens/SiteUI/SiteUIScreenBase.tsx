import {useBackHandler} from '@react-native-community/hooks';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {SiteUIScreenActionsMenu} from '#src/Components/Menus/SiteUI/SiteUIScreenActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppIcons} from '#src/Enums/Icons';
import {useCommonStack} from '#src/Navigation/CommonScreens';

interface SiteUIScreenBaseProps {
  initialUrl: string;
  initialKey?: string;
  oobe?: boolean;
}

export const SiteUIScreenBase = ({initialUrl, initialKey = '', oobe}: SiteUIScreenBaseProps) => {
  const {serverUrl} = useSwiftarrQueryClient();
  const [webviewUrl, setWebviewUrl] = React.useState(initialUrl);
  const webViewRef = useRef<WebView>(null);
  const currentUrlRef = useRef<string>(initialUrl);
  const [key, setKey] = useState(initialKey);
  const [handleGoBack, setHandleGoBack] = useState(false);
  const navigation = useCommonStack();

  const onHome = useCallback(() => {
    setWebviewUrl(serverUrl);
    currentUrlRef.current = serverUrl;
    setKey(String(Date.now()));
  }, [serverUrl]);

  const reload = () => webViewRef.current?.reload();

  const getCurrentUrl = useCallback(() => currentUrlRef.current, []);

  const handleBackButtonPress = useCallback(() => {
    try {
      webViewRef.current?.goBack();
      return true;
    } catch (err) {
      return false;
    }
  }, []);

  const getNavBarIcons = useCallback(
    () => (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Reload'} iconName={AppIcons.reload} onPress={reload} />
          <SiteUIScreenActionsMenu onHome={onHome} oobe={oobe} getCurrentUrl={getCurrentUrl} />
        </HeaderButtons>
      </View>
    ),
    [onHome, oobe, getCurrentUrl],
  );

  const handleWebViewNavigationStateChange = (newNavState: WebViewNavigation) => {
    const {canGoBack, url} = newNavState;
    console.log(`[SiteUIScreenBase.tsx] webview navigating to ${url}`);
    setHandleGoBack(canGoBack);
    currentUrlRef.current = url;
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavBarIcons,
    });
  }, [getNavBarIcons, navigation]);

  // Override React Navigation back button to go back in webview when possible
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      // Only intercept if the action is not POP_TO_TOP (happens when you hit the Today tab).
      // If webview can go back and it's not a POP_TO_TOP action, prevent navigation and go back in webview instead
      const actionType = e.data?.action?.type;
      if (handleGoBack && actionType !== 'POP_TO_TOP') {
        e.preventDefault();
        handleBackButtonPress();
      }
      // Otherwise, let the default navigation behavior happen
    });

    return unsubscribe;
  }, [navigation, handleGoBack, handleBackButtonPress]);

  useBackHandler(() => {
    // This means we're gonna go back in the WebView, not in app.
    if (handleGoBack) {
      return handleBackButtonPress();
    }
    // Let the default thing happen, which is back in the app.
    return false;
  });

  return (
    <AppView safeEdges={oobe ? ['bottom'] : []}>
      <WebView
        source={{uri: webviewUrl}}
        key={key}
        ref={webViewRef}
        onNavigationStateChange={handleWebViewNavigationStateChange}
      />
    </AppView>
  );
};
