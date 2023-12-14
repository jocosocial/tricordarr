import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {DataTable} from 'react-native-paper';
import {View} from 'react-native';
import React, {useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {onlineManager} from '@tanstack/react-query';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../../styles/Theme';

export const QuerySettingsScreen = () => {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());
  const theme = useAppTheme();

  const handleOnline = (value: boolean) => {
    onlineManager.setOnline(value);
    setIsOnline(value);
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Query Client</DataTable.Title>
            </DataTable.Header>
            <DataTable.Row>
              <DataTable.Cell>Online</DataTable.Cell>
              <DataTable.Cell>{String(isOnline)}</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            buttonText={'Online'}
            onPress={() => handleOnline(true)}
            buttonColor={theme.colors.twitarrPositiveButton}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonText={'Offline'}
            onPress={() => handleOnline(false)}
            buttonColor={theme.colors.twitarrNegativeButton}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
