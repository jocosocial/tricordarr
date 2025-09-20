import React from 'react';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {StyleProp, View, ViewStyle} from 'react-native';
import {PerformerChip} from '#src/Components/Chips/PerformerChip.tsx';
import {CommonStackComponents, useCommonStack} from '#src/Components/Navigation/CommonScreens.tsx';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem.tsx';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {PerformerHeaderData} from '#src/Libraries/Structs/ControllerStructs.tsx';

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
