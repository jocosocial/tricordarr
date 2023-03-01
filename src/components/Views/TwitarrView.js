import {WebView} from 'react-native-webview';
import React, {useEffect, useState, useRef} from 'react';
import {AppSettings} from '../../libraries/AppSettings';
import {BackHandler, ActivityIndicator} from 'react-native';

export const TwitarrView = ({ route }) => {
  const [url, setUrl] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef();

  const handleBackButtonPress = () => {
    try {
      webViewRef.current?.goBack();
      return true;
    } catch (err) {
      console.log("[handleBackButtonPress] Error : ", err.message)
    }
  }

  const handleWebViewNavigationStateChange = (newNavState) => {
    const { canGoBack } = newNavState;
    if (canGoBack) {
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);
    }
    else {
      BackHandler.removeEventListener("hardwareBackPress", handleBackButtonPress);
    }
  }

  useEffect(() => {
    const loadSettings = async () => {
      let url = await AppSettings.SERVER_URL.getValue();

      if(route?.params?.resource) {
        url += `/${route.params.resource}`;

        if(route.params.id) {
          url += `/${route.params.id}`;
        }
      }

      setUrl(url);
      setIsLoading(false);
    }

    loadSettings();
  }, [route?.params?.resource, route?.params?.id, isLoading]);

  return (
    isLoading ? <ActivityIndicator /> :
    <WebView source={{ uri: url }}
      ref={webViewRef} 
      onNavigationStateChange={handleWebViewNavigationStateChange}
    />
  );
};
