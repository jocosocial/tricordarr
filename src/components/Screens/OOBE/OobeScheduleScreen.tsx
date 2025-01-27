import {AppView} from '../../Views/AppView.tsx';
import {useEventsQuery} from '../../Queries/Events/EventQueries.ts';
import React, {useCallback, useEffect, useRef} from 'react';
import {ScheduleFlatList} from '../../Lists/Schedule/ScheduleFlatList.tsx';
import {RefreshControl, View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {FlashList} from '@shopify/flash-list';
import {EventData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {ScheduleDayScreenActionsMenu} from '../../Menus/Schedule/ScheduleDayScreenActionsMenu.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents, OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator.tsx';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeScheduleScreen>;
export const OobeScheduleScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const listRef = useRef<FlashList<EventData>>(null);

  const {data, isFetching, refetch} = useEventsQuery({});

  const onRefresh = useCallback(async () => {
    await Promise.all([refetch()]);
  }, [refetch]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ScheduleDayScreenActionsMenu onRefresh={onRefresh} oobe={true} />
        </HeaderButtons>
      </View>
    );
  }, [onRefresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <View style={[commonStyles.flex]}>
        <ScheduleFlatList
          listRef={listRef}
          items={data || []}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} enabled={false} />}
        />
      </View>
    </AppView>
  );
};
