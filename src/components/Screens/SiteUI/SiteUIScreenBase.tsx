import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {useBackHandler} from '@react-native-community/hooks';
import {CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface SiteUIScreenBaseProps {
  initialUrl: string;
  initialKey?: string;
  navigation: NativeStackNavigationProp<CommonStackParamList>;
}

export const SiteUIScreenBase = ({navigation, initialUrl, initialKey = ''}: SiteUIScreenBaseProps) => {
  const {appConfig} = useConfig();
  const [webviewUrl, setWebviewUrl] = React.useState(initialUrl);
  const webViewRef = useRef<WebView>(null);
  const [key, setKey] = useState(initialKey);
  const [handleGoBack, setHandleGoBack] = useState(false);

  const onHome = useCallback(() => {
    setWebviewUrl(appConfig.serverUrl);
    setKey(String(Date.now()));
  }, [appConfig.serverUrl]);

  const reload = () => webViewRef.current?.reload();

  const getNavBarIcons = useCallback(
    () => (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Home'} iconName={AppIcons.home} onPress={onHome} />
          <Item title={'Reload'} iconName={AppIcons.reload} onPress={reload} />
        </HeaderButtons>
      </View>
    ),
    [onHome],
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
    <AppView>
      <WebView
        source={{uri: webviewUrl}}
        key={key}
        ref={webViewRef}
        onNavigationStateChange={handleWebViewNavigationStateChange}
      />
    </AppView>
  );
};
