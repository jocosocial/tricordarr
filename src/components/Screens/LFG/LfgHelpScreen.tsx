import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import React, {useCallback, useEffect} from 'react';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {StyleSheet, View} from 'react-native';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {ScheduleLfgListMenu} from '../../Menus/LFG/ScheduleLfgListMenu';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LfgStackParamList} from '../../Navigation/Stacks/LFGStackNavigator';
import {LfgStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {LfgFAB} from '../../Buttons/FloatingActionButtons/LfgFAB';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {useConfig} from '../../Context/Contexts/ConfigContext';

export type Props = NativeStackScreenProps<LfgStackParamList, LfgStackComponents.lfgHelpScreen, NavigatorIDs.lfgStack>;

export const LfgHelpScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {isLoggedIn} = useAuth();
  const {getLeftMainHeaderButtons} = useDrawer();
  const {appConfig} = useConfig();

  const styles = StyleSheet.create({
    title: {
      ...commonStyles.bold,
      ...commonStyles.marginBottomSmall,
    },
    paragraph: {
      ...commonStyles.marginBottomSmall,
    },
  });

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ScheduleLfgListMenu />
        </HeaderButtons>
      </View>
    );
  }, [isLoggedIn]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
    if (appConfig.schedule.defaultLfgScreen === LfgStackComponents.lfgHelpScreen) {
      navigation.setOptions({
        headerLeft: getLeftMainHeaderButtons,
      });
    }
  }, [navigation, getNavButtons, appConfig.schedule.defaultLfgScreen, getLeftMainHeaderButtons]);

  return (
    <AppView>
      <ScrollingContentView overScroll={true}>
        <PaddedContentView>
          <Text variant={'titleLarge'} style={styles.title}>
            What's a Looking For Group (LFG)?
          </Text>
          <Text style={styles.paragraph}>
            A small(ish) community organized event. If you want to play a board game, start a band, go on a shore
            excursion, eat at a restaurant, drink like a pirate, get some exercise, visit the spa, sing a song, craft a
            crafty thing, play shuffleboard, play basketball, or find pokemon, but you need more people, use LFG to find
            them. Create an LFG listing the thing you want to do, the time, and how many participants you'll need.
          </Text>
          <Text style={styles.paragraph}>
            If you're looking for something to do and want to meet some new people, check out the LFGs, find an activity
            that sounds fun, and join up.
          </Text>
          <Text variant={'titleLarge'} style={styles.title}>
            Can I make an LFG for 1000 people in Main Theatre and do my stand-up act onstage?
          </Text>
          <Text style={styles.paragraph}>
            No. Your stand-up act needs more work, LFGs are meant for small groups doing an activity together, all the
            'event' rooms on the ship are for actual Scheduled Events, and JoCo Cruise does not provide logistical or
            technical support for LFGs.
          </Text>
          <Text style={styles.paragraph}>
            If your LFG idea is 'come listen to me talk', the thing you want is a Shadow Event.
          </Text>
          <Text variant={'titleLarge'} style={styles.title}>
            I scheduled an LFG at a place but it's full of people doing something else? What gives?
          </Text>
          <Text style={styles.paragraph}>
            LFGs are not a reservation system of any sort. Luckily, LFGs have built-in chat, so you can come up with a
            backup plan with everyone and meet somewhere else/play a different game/eat at a different restaurant.
          </Text>
          <Text variant={'titleLarge'} style={styles.title}>
            What about adult-themed LFGs?
          </Text>
          <Text style={styles.paragraph}>
            People of all ages read Twitt-Arr and LFGs are a public forum like the rest of Twitt-Arr, please use the
            usual discretion and keep the Code of Conduct in mind.
          </Text>
          <Text variant={'titleLarge'} style={styles.title}>
            There are too many. How can I filter LFGs?
          </Text>
          <Text style={styles.paragraph}>
            You can filter LFGs by using the filter menus at the top of the screen. A filter is active if the menu icon
            is blue and the item in the list is slightly highlighted. Long press the menu button to clear all active
            filters.
          </Text>
          <Text variant={'titleLarge'} style={styles.title}>
            Can I change the default screen of the LFG tab away from this Help?
          </Text>
          <Text style={styles.paragraph}>
            Yes! Tap the menu in the upper right of any LFG screen and select Settings. You can then change the Default
            LFG Screen. Any change requires an app restart. This Help is always available via the floating action button
            in the bottom right of the LFG screens.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
      <LfgFAB />
    </AppView>
  );
};
