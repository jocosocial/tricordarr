import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {ScrollView, View} from 'react-native';
import {Text} from 'react-native-paper';

import {ModalCard} from '#src/Components/Cards/ModalCard';
import {useStyles} from '#src/Context/Contexts/StyleContext';

const ModalContent = () => {
  const queryClient = useQueryClient();
  const {commonStyles} = useStyles();
  const contents = queryClient.getQueryCache().getAll();
  return (
    <View>
      {contents.map((query, index) => {
        return (
          <Text style={commonStyles.paddingBottomSmall} selectable={true} key={index}>
            {query.queryKey.toString()}
          </Text>
        );
      })}
    </View>
  );
};

export const QueryKeysModalView = () => {
  return (
    <ScrollView>
      <ModalCard title={'Cached Keys'} content={<ModalContent />} />
    </ScrollView>
  );
};
