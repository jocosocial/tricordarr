import React, {useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {RefreshControl} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScheduleStackParamList} from '../../Navigation/Stacks/ScheduleStackNavigator';
import {NavigatorIDs, ScheduleStackComponents} from '../../../libraries/Enums/Navigation';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';
import {LfgCard} from '../../Cards/Schedule/LfgCard';

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.lfgScreen,
  NavigatorIDs.scheduleStack
>;

// @TODO twitarrcontext, setfez, figure out what to do with chat.
export const LfgScreen = ({navigation, route}: Props) => {
  const {data, refetch, isFetching} = useSeamailQuery({
    fezID: route.params.fezID,
  });

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <PaddedContentView>{data && <LfgCard lfg={data.pages[0]} />}</PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
