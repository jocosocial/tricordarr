import React from 'react';
import {View} from 'react-native';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {useFezQuery} from '../../Queries/Fez/FezQueries';
import {FezCard} from '../Schedule/FezCard.tsx';

export const NextLFGCard = ({lfgID}: {lfgID: string}) => {
  const {data} = useFezQuery({fezID: lfgID});
  const commonNavigation = useCommonStack();

  return (
    <View>
      {data && (
        <FezCard
          fez={data.pages[0]}
          showDay={true}
          onPress={() => commonNavigation.push(CommonStackComponents.lfgScreen, {fezID: lfgID})}
          titleHeader={'Your next appointment:'}
        />
      )}
    </View>
  );
};
