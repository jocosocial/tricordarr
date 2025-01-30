import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {usePerformerSelfQuery} from '../../Queries/Performer/PerformerQueries.ts';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {PerformerScreenBase} from './PerformerScreenBase.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.performerEditScreen>;

export const PerformerEditScreen = () => {
  const {data, refetch, isFetching} = usePerformerSelfQuery();

  const onRefresh = async () => {
    await refetch();
  };

  if (!data) {
    return <LoadingView />;
  }

  console.log(data);

  return <PerformerScreenBase performerData={data} onRefresh={onRefresh} isFetching={isFetching} />;
};
