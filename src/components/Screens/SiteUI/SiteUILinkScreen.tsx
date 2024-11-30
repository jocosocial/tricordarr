import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {useBackHandler} from '@react-native-community/hooks';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.siteUILinkScreen>;

export const SiteUILinkScreen = ({route, navigation}: Props) => {
  console.log(route.path);
  const {appConfig} = useConfig();
  const [webviewUrl, setWebviewUrl] = React.useState<string>(`${appConfig.serverUrl}/${route.path}`);
  const webViewRef = useRef<WebView>(null);
  const [key, setKey] = useState('');
  const [handleGoBack, setHandleGoBack] = useState(false);

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

  const handleWebViewNavigationStateChange = (newNavState: WebViewNavigation) => {
    const {canGoBack, url} = newNavState;
    console.log(`[RouteTest.tsx] webview navigating to ${url}`);
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
