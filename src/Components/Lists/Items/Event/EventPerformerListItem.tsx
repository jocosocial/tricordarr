import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

import {PerformerChip} from '#src/Components/Chips/PerformerChip';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {PerformerHeaderData} from '#src/Structs/ControllerStructs';

interface EventPerformerListItemProps {
  iconStyle?: StyleProp<ViewStyle>;
  itemStyle?: ViewStyle;
  performers: PerformerHeaderData[];
}

export const EventPerformerListItem = (props: EventPerformerListItemProps) => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();

  const getDescription = () => {
    return (
      <View style={commonStyles.chipContainer}>
        {props.performers.map((performer, index) => {
          return (
            <PerformerChip
              key={index}
              performerHeader={performer}
              onPress={() => {
                if (performer.id) {
                  navigation.push(CommonStackComponents.performerScreen, {
                    id: performer.id,
                  });
                }
              }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <DataFieldListItem
      itemStyle={props.itemStyle}
      icon={AppIcons.performer}
      title={'Featuring'}
      description={getDescription}
    />
  );
};
