import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {usePerformerSelfQuery} from '../../Queries/Performer/PerformerQueries.ts';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {PerformerScreenBase} from './PerformerScreenBase.tsx';
import {View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {PerformerActionsMenu} from '../../Menus/Performer/PerformerActionsMenu.tsx';
import {useAuth} from '../../Context/Contexts/AuthContext.ts';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.performerSelfScreen>;

export const PerformerSelfScreen = ({navigation}: Props) => {
  const {data, refetch, isFetching} = usePerformerSelfQuery();
  const {tokenData} = useAuth();

  const onRefresh = async () => {
    await refetch();
  };

  const getHeaderButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          {data?.user?.userID === tokenData?.userID && (
            <Item title={'Edit'} onPress={() => console.log('edit')} iconName={AppIcons.edit} />
          )}
          <PerformerActionsMenu performerData={data} />
        </HeaderButtons>
      </View>
    );
  }, [data, tokenData?.userID]);

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
