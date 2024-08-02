import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControl, Text, View} from 'react-native';
import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {usePersonalEventsQuery} from '../../Queries/PersonalEvent/PersonalEventQueries.tsx';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {PersonalEventCard} from '../../Cards/Schedule/PersonalEventCard.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {EventStackComponents} from '../../../libraries/Enums/Navigation.ts';
import {EventStackParamList} from '../../Navigation/Stacks/EventStackNavigator.tsx';
import {PersonalEventsFAB} from '../../Buttons/FloatingActionButtons/PersonalEventsFAB.tsx';

type Props = NativeStackScreenProps<EventStackParamList, EventStackComponents.personalEventListScreen>;
export const PersonalEventListScreen = ({navigation}: Props) => {
  const [expandFab, setExpandFab] = React.useState(true);
  const {data: eventList, isFetching, refetch, isFetched} = usePersonalEventsQuery({});
  const {commonStyles} = useStyles();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (event.nativeEvent.contentOffset.y <= 150) {
      setExpandFab(true);
    } else {
      setExpandFab(false);
    }
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(EventStackComponents.personalEventHelpScreen)}
          />
        </HeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!eventList) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        onScroll={handleScroll}>
        <PaddedContentView padTop={true}>
          {isFetched && eventList.length === 0 && (
            <View key={'noResults'} style={[commonStyles.paddingVerticalSmall]}>
              <Text>No Results</Text>
            </View>
          )}
          {eventList.map((pe, i) => (
            <View key={i} style={[commonStyles.marginBottom]}>
              <PersonalEventCard
                showDay={true}
                eventData={pe}
                onPress={() =>
                  navigation.push(CommonStackComponents.personalEventScreen, {
                    eventID: pe.personalEventID,
                  })
                }
              />
            </View>
          ))}
        </PaddedContentView>
      </ScrollingContentView>
      <PersonalEventsFAB showLabel={expandFab} />
    </AppView>
  );
};
