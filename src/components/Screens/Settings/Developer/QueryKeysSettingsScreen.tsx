import React from 'react';
import {AppView} from '../../../Views/AppView.tsx';
import {FlashList} from '@shopify/flash-list';
import {Query, useQueryClient} from '@tanstack/react-query';
import {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View, StyleSheet, TouchableOpacity} from 'react-native';
import {Divider, Text} from 'react-native-paper';
import {useStyles} from '../../../Context/Contexts/StyleContext.ts';
import Clipboard from '@react-native-clipboard/clipboard';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  SettingsStackParamList,
  SettingsStackScreenComponents,
} from '../../../Navigation/Stacks/SettingsStackNavigator.tsx';

export type Props = NativeStackScreenProps<
  SettingsStackParamList,
  SettingsStackScreenComponents.queryKeysSettingsScreen
>;

export const QueryKeysSettingsScreen = ({navigation}: Props) => {
  const queryClient = useQueryClient();
  const [contents, setContents] = useState<Query[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const {commonStyles} = useStyles();

  const refresh = useCallback(() => {
    setRefreshing(true);
    setContents(queryClient.getQueryCache().getAll());
    setRefreshing(false);
  }, [queryClient]);

  const styles = StyleSheet.create({
    itemContainer: {
      ...commonStyles.paddingHorizontal,
      ...commonStyles.paddingVerticalSmall,
    },
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  const renderItem = ({item}: {item: Query}) => {
    const onPress = () =>
      navigation.push(SettingsStackScreenComponents.queryDataSettingsScreen, {
        queryHash: item.queryHash,
      });
    const onLongPress = () => Clipboard.setString(item.queryKey.toString());
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
          <Text>{item.queryKey.toString()}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const itemSeparator = () => <Divider bold={true} />;

  return (
    <AppView>
      <FlashList
        renderItem={renderItem}
        data={contents}
        refreshControl={<RefreshControl onRefresh={refresh} refreshing={refreshing} />}
        extraData={styles}
        ItemSeparatorComponent={itemSeparator}
        estimatedItemSize={46}
      />
    </AppView>
  );
};
