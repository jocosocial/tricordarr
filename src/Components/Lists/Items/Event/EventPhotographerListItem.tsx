import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

import {UserChip} from '#src/Components/Chips/UserChip';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface EventPhotographerListItemProps {
  iconStyle?: StyleProp<ViewStyle>;
  itemStyle?: ViewStyle;
  photographers: UserHeader[];
}

export const EventPhotographerListItem = (props: EventPhotographerListItemProps) => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();

  const getDescription = () => {
    return (
      <View style={commonStyles.chipContainer}>
        {props.photographers.map((photographer, index) => {
          return (
            <UserChip
              key={photographer.userID}
              userHeader={photographer}
              onPress={() => {
                navigation.push(CommonStackComponents.userProfileScreen, {
                  userID: photographer.userID,
                });
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
      icon={AppIcons.shutternaut}
      title={'Photographers'}
      description={getDescription}
    />
  );
};
