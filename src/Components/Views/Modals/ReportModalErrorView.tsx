import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {ModalCard} from '#src/Components/Cards/ModalCard';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const ReportModalErrorView = () => {
  const {commonStyles} = useStyles();

  return (
    <View>
      <ModalCard
        title={'Report'}
        content={
          <Text style={[commonStyles.marginBottomSmall]}>
            Something has gone wrong! Please message TwitarrTeam for assistance.
          </Text>
        }
      />
    </View>
  );
};
