import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {usePerformerQuery} from '../../Queries/Performer/PerformerQueries.ts';
import {View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {PerformerActionsMenu} from '../../Menus/Performer/PerformerActionsMenu.tsx';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {PerformerScreenBase} from './PerformerScreenBase.tsx';

type Props = NativeStackScreenProps<MainStackParamList, CommonStackComponents.performerScreen>;

export const PerformerScreen = ({route, navigation}: Props) => {
  const {data, refetch, isFetching} = usePerformerQuery(route.params.id);

  const getHeaderButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <PerformerActionsMenu performerData={data} />
        </HeaderButtons>
      </View>
    );
  }, [data]);

  const onRefresh = async () => {
    await refetch();
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: getHeaderButtons,
    });
  }, [navigation, getHeaderButtons]);

  if (!data) {
    return <LoadingView />;
  }

  return <PerformerScreenBase performerData={data} onRefresh={onRefresh} isFetching={isFetching} />;
};
