import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {usePerformerQuery} from '../../Queries/Performer/PerformerQueries.ts';
import {View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {PerformerActionsMenu} from '../../Menus/Performer/PerformerActionsMenu.tsx';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {PerformerScreenBase} from './PerformerScreenBase.tsx';
import {useUserProfileQuery} from '../../Queries/User/UserQueries.ts';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';

type Props = NativeStackScreenProps<MainStackParamList, CommonStackComponents.performerScreen>;

export const PerformerScreen = ({route, navigation}: Props) => {
  const {data, refetch, isFetching} = usePerformerQuery(route.params.id);
  const {data: profilePublicData} = useUserProfileQuery();

  const getHeaderButtons = useCallback(() => {
    const eventID = route.params.eventID;
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          {data && eventID && profilePublicData && profilePublicData.header.userID === data?.user?.userID && (
            <Item
              title={'Edit'}
              iconName={AppIcons.edit}
              onPress={() =>
                navigation.push(CommonStackComponents.performerEditScreen, {
                  performerData: data,
                  eventID: eventID,
                })
              }
            />
          )}
          <PerformerActionsMenu performerData={data} />
        </HeaderButtons>
      </View>
    );
  }, [data, navigation, profilePublicData, route]);

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
