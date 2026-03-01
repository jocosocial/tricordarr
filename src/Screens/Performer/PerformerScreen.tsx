import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PerformerActionsMenu} from '#src/Components/Menus/Performer/PerformerActionsMenu';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {usePerformerQuery} from '#src/Queries/Performer/PerformerQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PerformerScreenBase} from '#src/Screens/Performer/PerformerScreenBase';

type Props = StackScreenProps<MainStackParamList, CommonStackComponents.performerScreen>;

export const PerformerScreen = (props: Props) => {
  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.performers} urlPath={`/performer/${props.route.params.id}`}>
      <PerformerScreenInner {...props} />
    </DisabledFeatureScreen>
  );
};

const PerformerScreenInner = ({route, navigation}: Props) => {
  const {data, refetch, isFetching} = usePerformerQuery(route.params.id);
  const {currentUserID} = useSession();

  const getHeaderButtons = useCallback(() => {
    const eventID = route.params.eventID;
    return (
      <View>
        <MaterialHeaderButtons>
          {data && eventID && currentUserID === data?.user?.userID && (
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
        </MaterialHeaderButtons>
      </View>
    );
  }, [data, navigation, currentUserID, route]);

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
