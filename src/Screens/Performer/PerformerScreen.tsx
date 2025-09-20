import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {PerformerActionsMenu} from '#src/Components/Menus/Performer/PerformerActionsMenu';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {usePerformerQuery} from '#src/Queries/Performer/PerformerQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {PerformerScreenBase} from '#src/Screens/Performer/PerformerScreenBase';

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
