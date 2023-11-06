import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import React from 'react';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {StyleSheet} from 'react-native';

export const LfgHelpScreen = () => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    title: {
      ...commonStyles.bold,
      ...commonStyles.marginBottomSmall,
    },
    paragraph: {
      ...commonStyles.marginBottomSmall,
    },
  });

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text variant={'titleLarge'} style={styles.title}>
            What's a Looking For Group (LFG)?
          </Text>
          <Text style={styles.paragraph}>
            If you want to play a board game, start a band, go on a shore excursion, eat at a restaurant, drink like a
            pirate, get some exercise, visit the spa, sing a song, craft a crafty thing, play shuffleboard, play
            basketball, or find pokemon, but you need more people, use LFG to find them. Create an LFG listing the thing
            you want to do, the time, and how many participants you'll need.
          </Text>
          <Text style={styles.paragraph}>
            If you're looking for something to do and want to meet some new people, check out the LFGs, find an activity
            that sounds fun, and join up.
          </Text>
          <Text variant={'titleLarge'} style={styles.title}>
            Can I make an LFG for 1000 people in Main Theatre and do my standup act onstage?
          </Text>
          <Text style={styles.paragraph}>
            No. Your standup act needs more work, LFGs are meant for small groups doing an activity together, all the
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
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
