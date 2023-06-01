import {WebView} from 'react-native-webview';
import React, {useEffect, useState, useRef, useCallback} from 'react';
import {AppSettings} from '../../libraries/AppSettings';
import {ActivityIndicator, View} from 'react-native';
import {useBackHandler} from '@react-native-community/hooks';
import {AppView} from './AppView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SiteUIStackScreenComponents} from '../../libraries/Enums/Navigation';
import {SiteUIStackParamList} from '../Navigation/Stacks/SiteUIStack';
import {NavBarIconButton} from '../Buttons/IconButtons/NavBarIconButton';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useStyles} from '../Context/Contexts/StyleContext';
import {useConfig} from '../Context/Contexts/ConfigContext';

type Props = NativeStackScreenProps<
  SiteUIStackParamList,
  SiteUIStackScreenComponents.siteUIScreen,
  NavigatorIDs.siteUIStack
>;

export const TwitarrView = ({route, navigation}: Props) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState('');
  const [handleGoBack, setHandleGoBack] = useState(false);
  const webViewRef = useRef<WebView>();
  const {commonStyles} = useStyles();
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

  const handleWebViewNavigationStateChange = newNavState => {
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
      <View style={[commonStyles.flexRow]}>
        <NavBarIconButton
          icon={AppIcons.home}
          onPress={async () => {
            setUrl(appConfig.serverUrl);
            setKey('home');
          }}
        />
        <NavBarIconButton icon={AppIcons.reload} onPress={() => webViewRef.current?.reload()} />
      </View>
    ),
    [commonStyles],
  );

  useEffect(() => {
    const loadSettings = async () => {
      let newUrl = appConfig.serverUrl;

      if (route?.params?.resource) {
        newUrl += `/${route.params.resource}`;

        if (route.params.id) {
          newUrl += `/${route.params.id}`;
        }
      }

      setUrl(newUrl);
      setIsLoading(false);
    };

    if (route?.params?.timestamp != key) {
      setKey(route?.params?.timestamp);
      setHandleGoBack(false);
    }

    loadSettings();

    navigation.setOptions({
      headerRight: getNavBarIcons,
    });
  }, [route.params?.timestamp, route.params?.resource, route.params?.id, isLoading, key, navigation, getNavBarIcons]);

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
