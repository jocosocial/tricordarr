import React from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {OobeButtonsView} from '../../Views/OobeButtonsView';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeConductScreen, NavigatorIDs.oobeStack>;

export const OobeConductScreen = ({navigation}: Props) => {
  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text style={{fontWeight: 'bold'}} variant={'titleLarge'}>
            Be excellent to each other.
          </Text>
          <Text>
            Treat your fellow passengers with kindness and respect. This is an enthusiastic and supportive community,
            and it is all of our responsibility to maintain it. JoCo Cruise is dedicated to fostering a diverse, safe
            and welcoming environment for all attendees regardless of race, gender identity or expression, sexual
            orientation, age, disability, body size or type, neurotype, physical appearance, or religion; this extends
            to your interactions with fellow attendees. Invite people into your conversations and activities; be
            supportive when your fellow attendees try new things (or choose not to); participate, connect, help out.
            Events like these can feel lonely and intimidating when you’re new and don’t know anybody. Be welcoming,
            inclusive and friendly, and look out for one another!
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={{fontWeight: 'bold'}} variant={'titleLarge'}>
            Don’t harass others.
          </Text>
          <Text>
            We are not a community that tolerates harassment. This includes (but isn’t limited to): any kind of
            physical, verbal, or psychological abuse; threats, intimidation, and bullying; slurs about race, gender,
            sexuality or ability; unwanted romantic attention, sexual harassment, and generally creepy or stalky
            behavior; and photographing anyone or engaging in physical interactions (hugging, tickling, backrubs, etc.)
            without consent. If someone asks you to stop doing something and you keep doing it, that’s harassment. We’re
            all responsible for making sure this doesn’t occur in our community.
          </Text>
        </PaddedContentView>
        <OobeButtonsView
          leftOnPress={() => navigation.goBack()}
          rightText={'I Agree'}
          rightOnPress={() => navigation.push(OobeStackComponents.oobeAccountScreen)}
        />
      </ScrollingContentView>
    </AppView>
  );
};
