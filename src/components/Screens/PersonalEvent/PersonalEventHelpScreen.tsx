import React from 'react';
import {Text} from 'react-native';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';

export const PersonalEventHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <Text>Personal events are not a way to reserve space.</Text>
        <Text>Confirm that the time your event is shown in Twitarr makes sense with the ships clocks.</Text>
      </ScrollingContentView>
    </AppView>
  );
};
