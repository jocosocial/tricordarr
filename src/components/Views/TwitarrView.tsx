import {WebView, WebViewNavigation} from 'react-native-webview';
import React, {useEffect, useState, useRef, useCallback} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useBackHandler} from '@react-native-community/hooks';
import {AppView} from './AppView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useConfig} from '../Context/Contexts/ConfigContext';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../Buttons/MaterialHeaderButton';
import {CommonStackComponents, CommonStackParamList} from '../Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.siteUIScreen>;

export const TwitarrView = ({route, navigation}: Props) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState('');
  const [handleGoBack, setHandleGoBack] = useState(false);
  const webViewRef = useRef<WebView>();
  const {appConfig} = useConfig();

  const handleBackButtonPress = () => {
    try {
      webViewRef.current?.goBack();
      return true;
    } catch (err) {
      console.log('[handleBackButtonPress] Error : ', err.message);
      return false;
    }
  };

  const handleWebViewNavigationStateChange = (newNavState: WebViewNavigation) => {
    const {canGoBack} = newNavState;
    setHandleGoBack(canGoBack);
  };

  useBackHandler(() => {
    if (handleGoBack) {
      return handleBackButtonPress();
    }
    // let the default thing happen
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
              if (route.params) {
                // This prevents the useEffect from resetting the state
                // back to whatever route params we were given.
                route.params.resource = undefined;
                route.params.id = undefined;
              }
              setUrl(`${appConfig.serverUrl}/home`);
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
    const loadSettings = async () => {
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

      setUrl(newUrl);
      setIsLoading(false);
    };

    if (route?.params?.timestamp !== key) {
      setKey(route?.params?.timestamp);
      setHandleGoBack(false);
    }

    loadSettings();

    navigation.setOptions({
      headerRight: getNavBarIcons,
    });
  }, [
    route.params?.timestamp,
    route.params.resource,
    route.params.id,
    isLoading,
    key,
    navigation,
    getNavBarIcons,
    appConfig.serverUrl,
  ]);

  return isLoading ? (
    <ActivityIndicator />
  ) : (
    <AppView>
      <WebView
        source={{uri: url}}
        key={key}
        ref={webViewRef}
        onNavigationStateChange={handleWebViewNavigationStateChange}
      />
    </AppView>
  );
};
