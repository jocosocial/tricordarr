import React from 'react';
import {View} from 'react-native';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {useFezQuery} from '../../Queries/Fez/FezQueries';
import {LfgCard} from '../Schedule/LfgCard';

export const NextLFGCard = ({lfgID}: {lfgID: string}) => {
  const {data} = useFezQuery({fezID: lfgID});
  const commonNavigation = useCommonStack();

  return (
    <View>
      {data && (
        <LfgCard
          lfg={data.pages[0]}
          showLfgIcon={false}
          showDay={true}
          onPress={() => commonNavigation.push(CommonStackComponents.lfgScreen, {fezID: lfgID})}
          titleHeader={'Your next LFG:'}
        />
      )}
    </View>
  );
};
