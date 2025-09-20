import React, {useCallback, useEffect} from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {EventSearchBar} from '#src/Components/Search/EventSearchBar';
import {View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/ScheduleStackNavigator';

export const EventSearchScreen = () => {
  const navigation = useScheduleStackNavigation();

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.scheduleHelpScreen)}
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

  return (
    <AppView>
      <EventSearchBar />
    </AppView>
  );
};
