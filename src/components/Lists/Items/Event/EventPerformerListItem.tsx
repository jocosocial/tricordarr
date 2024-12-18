import React from 'react';
import {AppIcons} from '../../../../libraries/Enums/Icons.ts';
import {StyleProp, View, ViewStyle} from 'react-native';
import {PerformerChip} from '../../../Chips/PerformerChip.tsx';
import {CommonStackComponents, useCommonStack} from '../../../Navigation/CommonScreens.tsx';
import {DataFieldListItem} from '../DataFieldListItem.tsx';
import {useStyles} from '../../../Context/Contexts/StyleContext.ts';
import {PerformerHeaderData} from '../../../../libraries/Structs/ControllerStructs.tsx';

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
