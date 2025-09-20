import React from 'react';
import {ScrollView, View} from 'react-native';
import {DataTable} from 'react-native-paper';
import {AppView} from '#src/Components/Views/AppView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

const toSecureString = (originalText?: string) => {
  if (!originalText) {
    return '';
  }
  // Extract the first three characters
  const firstThreeCharacters = originalText.slice(0, 3);

  // Replace the remaining characters with asterisks
  const asterisks = '*'.repeat(originalText.length - 3);

  // Concatenate the first three characters with asterisks
  return firstThreeCharacters + asterisks;
};

export const UserInfoSettingsScreen = () => {
  const {data: profilePublicData} = useUserProfileQuery();
  const {tokenData} = useAuth();
  return (
    <AppView>
      <ScrollView>
        <View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Profile Public Data</DataTable.Title>
            </DataTable.Header>
            <DataTable.Row>
              <DataTable.Cell>UserID</DataTable.Cell>
              <DataTable.Cell>{profilePublicData?.header.userID}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Username</DataTable.Cell>
              <DataTable.Cell>{profilePublicData?.header.username}</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>
        <View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Token Auth Data</DataTable.Title>
            </DataTable.Header>
            <DataTable.Row>
              <DataTable.Cell>UserID</DataTable.Cell>
              <DataTable.Cell>{tokenData?.userID}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Access Level</DataTable.Cell>
              <DataTable.Cell>{tokenData?.accessLevel}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Token</DataTable.Cell>
              <DataTable.Cell>{toSecureString(tokenData?.token)}</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>
      </ScrollView>
    </AppView>
  );
};
