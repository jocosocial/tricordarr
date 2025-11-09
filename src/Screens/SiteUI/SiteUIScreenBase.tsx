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

  const getNavBarIcons = useCallback(
    () => (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Reload'} iconName={AppIcons.reload} onPress={reload} />
          <SiteUIScreenActionsMenu
            onHome={onHome}
            onBack={handleBackButtonPress}
            canGoBack={handleGoBack}
            oobe={oobe}
            getCurrentUrl={getCurrentUrl}
          />
        </HeaderButtons>
      </View>
    ),
    [onHome, oobe, handleGoBack, getCurrentUrl],
  );

  const handleWebViewNavigationStateChange = (newNavState: WebViewNavigation) => {
    const {canGoBack, url} = newNavState;
    console.log(`[SiteUIScreenBase.tsx] webview navigating to ${url}`);
    setHandleGoBack(canGoBack);
    currentUrlRef.current = url;
  };

  const handleBackButtonPress = () => {
    try {
      webViewRef.current?.goBack();
      return true;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavBarIcons,
    });
  }, [getNavBarIcons, navigation]);

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
