import {Formik} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {Text} from 'react-native-paper';

import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {ListItem} from '#src/Components/Lists/ListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {SocketControlView} from '#src/Components/Views/SocketControlView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {WebSocketState} from '#src/Libraries/Network/Websockets';

export const SocketSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [refreshing, setRefreshing] = useState(false);
  const {closeNotificationSocket, notificationSocket} = useSocket();
  const {commonStyles} = useStyles();
  const [notificationSocketState, setNotificationSocketState] = useState(
    WebSocketState[notificationSocket?.readyState as keyof typeof WebSocketState],
  );

  async function toggleNotificationSocket() {
    updateAppConfig({
      ...appConfig,
      enableNotificationSocket: !appConfig.enableNotificationSocket,
    });
  }

  async function toggleFezSocket() {
    updateAppConfig({
      ...appConfig,
      enableFezSocket: !appConfig.enableFezSocket,
    });
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setNotificationSocketState(WebSocketState[notificationSocket?.readyState as keyof typeof WebSocketState]);
    setRefreshing(false);
  }, [notificationSocket, setNotificationSocketState, setRefreshing]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <AppView>
      <ScrollingContentView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        isStack={true}>
        <Formik initialValues={{}} onSubmit={() => {}}>
          <View>
            <ListSection>
              <ListSubheader>Notification Socket</ListSubheader>
              <ListItem title={'Socket State'} description={notificationSocketState} />
              <PaddedContentView padSides={false}>
                <BooleanField
                  name={'enableNotificationSocket'}
                  label={'Enable'}
                  value={appConfig.enableNotificationSocket}
                  onPress={toggleNotificationSocket}
                  helperText={
                    'Used for general purpose notifications across all app features. Not used for background connection.'
                  }
                  style={commonStyles.paddingHorizontalSmall}
                />
              </PaddedContentView>
              <PaddedContentView>
                <SocketControlView
                  title={'Reset Notification Socket'}
                  disabled={!appConfig.enableNotificationSocket}
                  onReset={closeNotificationSocket}
                />
                <Text variant={'bodyMedium'}>
                  This triggers a socket close and open. The socket can be disabled or more persistently closed by
                  disabling it above. You may need to refresh this screen for current state.
                </Text>
              </PaddedContentView>
            </ListSection>
            <ListSection>
              <ListSubheader>Fez Socket</ListSubheader>
              <PaddedContentView padSides={false}>
                <BooleanField
                  name={'enableFezSocket'}
                  label={'Enable'}
                  value={appConfig.enableFezSocket}
                  onPress={toggleFezSocket}
                  helperText={
                    'Opened when a fez is loaded. Provides membership change messages in addition to content updates.'
                  }
                  style={commonStyles.paddingHorizontalSmall}
                />
              </PaddedContentView>
            </ListSection>
          </View>
        </Formik>
      </ScrollingContentView>
    </AppView>
  );
};
