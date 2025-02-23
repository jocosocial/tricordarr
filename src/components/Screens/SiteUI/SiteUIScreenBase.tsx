import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {useBackHandler} from '@react-native-community/hooks';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface SiteUIScreenBaseProps {
  initialUrl: string;
  initialKey?: string;
  oobe?: boolean;
}

export const SiteUIScreenBase = ({initialUrl, initialKey = '', oobe}: SiteUIScreenBaseProps) => {
  const {serverUrl} = useSwiftarrQueryClient();
  const [webviewUrl, setWebviewUrl] = React.useState(initialUrl);
  const webViewRef = useRef<WebView>(null);
  const [key, setKey] = useState(initialKey);
  const [handleGoBack, setHandleGoBack] = useState(false);
  const navigation = useCommonStack();

  const onHome = useCallback(() => {
    setWebviewUrl(serverUrl);
    setKey(String(Date.now()));
  }, [serverUrl]);

  const reload = () => webViewRef.current?.reload();

  const onHelp = useCallback(
    () => navigation.push(CommonStackComponents.siteUIHelpScreen, {oobe: oobe}),
    [navigation, oobe],
  );

  const getNavBarIcons = useCallback(
    () => (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Home'} iconName={AppIcons.home} onPress={onHome} />
          <Item title={'Reload'} iconName={AppIcons.reload} onPress={reload} />
          <Item title={'Help'} iconName={AppIcons.help} onPress={onHelp} />
        </HeaderButtons>
      </View>
    ),
    [onHelp, onHome],
  );

  const handleWebViewNavigationStateChange = (newNavState: WebViewNavigation) => {
    const {canGoBack, url} = newNavState;
    console.log(`[SiteUIScreenBase.tsx] webview navigating to ${url}`);
    setHandleGoBack(canGoBack);
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
