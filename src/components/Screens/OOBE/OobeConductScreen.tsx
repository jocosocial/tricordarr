import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {OobeButtonsView} from '../../Views/OobeButtonsView';
import {ConductView} from '../../Views/Static/ConductView';
import {useConductQuery} from '../../Queries/PublicQueries';
import {LoadingView} from '../../Views/Static/LoadingView';
import {RefreshControl} from 'react-native';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeConductScreen>;

export const OobeConductScreen = ({navigation}: Props) => {
  const {data, refetch, isFetching} = useConductQuery();
  if (!data) {
    return <LoadingView onRefresh={refetch} refreshing={isFetching} />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={false}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <ConductView docs={[data.guidelines, data.codeofconduct, data.twitarrconduct]} />
        <OobeButtonsView
          leftOnPress={() => navigation.goBack()}
          rightText={'I Agree'}
          rightOnPress={() => navigation.push(OobeStackComponents.oobeAccountScreen)}
          rightDisabled={!data}
        />
      </ScrollingContentView>
    </AppView>
  );
};
