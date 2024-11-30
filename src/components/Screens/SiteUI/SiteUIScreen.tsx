import {WebView, WebViewNavigation} from 'react-native-webview';
import React, {useEffect, useState, useRef, useCallback} from 'react';
import {View} from 'react-native';
import {useBackHandler} from '@react-native-community/hooks';
import {AppView} from '../../Views/AppView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.siteUIScreen>;

export const SiteUIScreen = ({route, navigation}: Props) => {
  const {appConfig} = useConfig();

  const getInitialUrl = () => {
    let newUrl = appConfig.serverUrl;

    if (route.params.moderate) {
      newUrl += '/moderate';
    }

    if (route?.params?.resource) {
      newUrl += `/${route.params.resource}`;

      if (route.params.id) {
        newUrl += `/${route.params.id}`;
      }
    }
    return newUrl;
  };

  const [webviewUrl, setWebviewUrl] = useState(getInitialUrl());
  const [key, setKey] = useState('');
  const [handleGoBack, setHandleGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleBackButtonPress = () => {
    try {
      webViewRef.current?.goBack();
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleWebViewNavigationStateChange = (newNavState: WebViewNavigation) => {
    const {canGoBack, url} = newNavState;
    console.log(`[SiteUIScreen.tsx] webview navigating to ${url}`);
    setHandleGoBack(canGoBack);
  };

  useBackHandler(() => {
    // This means we're gonna go back in the WebView, not in app.
    if (handleGoBack) {
      return handleBackButtonPress();
    }
    // Let the default thing happen, which is back in the app.
    return false;
  });

  const getNavBarIcons = useCallback(
    () => (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Home'}
            iconName={AppIcons.home}
            onPress={() => {
              setWebviewUrl(appConfig.serverUrl);
              setKey(String(Date.now()));
            }}
          />
          <Item title={'Reload'} iconName={AppIcons.reload} onPress={() => webViewRef.current?.reload()} />
        </HeaderButtons>
      </View>
    ),
    [appConfig.serverUrl],
  );

  useEffect(() => {
    if (route?.params?.timestamp !== key && route.params.timestamp) {
      setKey(route.params.timestamp);
      setHandleGoBack(false);
    }

    navigation.setOptions({
      headerRight: getNavBarIcons,
    });
  }, [
    route.params.timestamp,
    route.params.resource,
    route.params.id,
    route.params.moderate,
    key,
    navigation,
    getNavBarIcons,
    appConfig.serverUrl,
  ]);

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
