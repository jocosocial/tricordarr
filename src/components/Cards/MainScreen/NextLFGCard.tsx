import React from 'react';
import {View} from 'react-native';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {useFezQuery} from '../../Queries/Fez/FezQueries';
import {FezCard} from '../Schedule/FezCard.tsx';
import {FezType} from '../../../libraries/Enums/FezType.ts';

export const NextLFGCard = ({lfgID}: {lfgID: string}) => {
  const {data} = useFezQuery({fezID: lfgID});
  const commonNavigation = useCommonStack();

  return (
    <View>
      {data && (
        <FezCard
          fez={data.pages[0]}
          showDay={true}
          onPress={() => {
            if (FezType.isLFGType(data.pages[0].fezType)) {
              commonNavigation.push(CommonStackComponents.lfgScreen, {fezID: lfgID});
            } else if (FezType.isPrivateEventType(data.pages[0].fezType)) {
              commonNavigation.push(CommonStackComponents.personalEventScreen, {eventID: lfgID});
            }
          }}
          titleHeader={'Your next appointment:'}
        />
      )}
    </View>
  );
};
