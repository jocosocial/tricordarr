import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';

import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {SelectionActions} from '#src/Reducers/SelectionReducer';
import {ForumListData} from '#src/Structs/ControllerStructs';
import {SegmentedButtonType} from '#src/Types';
import {Selectable} from '#src/Types/Selection';

interface SelectionButtonsProps {
  items?: ForumListData[];
}

export const SelectionButtons = ({items = []}: SelectionButtonsProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const isFocused = useIsFocused();
  const {dispatchSelectedItems, setEnableSelection, selectedItems} = useSelection();

  const styles = StyleSheet.create({
    button: {
      ...commonStyles.onSurfaceVariant,
    },
    container: {
      ...commonStyles.paddingHorizontal,
      ...commonStyles.surfaceVariant,
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
      ...commonStyles.minHeightLarge,
      ...commonStyles.alignItemsCenter,
      height: 56, // I don't love that this is static
    },
  });

  const buttons: SegmentedButtonType[] = [
    {
      value: 'all',
      label: 'All',
      icon: AppIcons.selectAll,
      style: styles.button,
    },
    {
      value: 'inverse',
      label: 'Inverse',
      icon: AppIcons.selectInverse,
      style: styles.button,
    },
    {
      value: 'none',
      label: 'None',
      icon: AppIcons.selectNone,
      style: styles.button,
    },
    {
      value: 'cancel',
      label: 'Cancel',
      icon: AppIcons.cancel,
      style: styles.button,
    },
  ];

  const onValueChange = (value: string) => {
    switch (value) {
      case 'none':
        dispatchSelectedItems({
          type: SelectionActions.clear,
        });
        break;
      case 'all':
        dispatchSelectedItems({
          type: SelectionActions.set,
          items: items.map(Selectable.fromForumListData),
        });
        break;
      case 'inverse':
        const inverted = items.filter(
          allItem => !selectedItems.some(selectedItem => selectedItem.id === allItem.forumID),
        );
        dispatchSelectedItems({
          type: SelectionActions.set,
          items: inverted.map(Selectable.fromForumListData),
        });
        break;
      case 'cancel':
        dispatchSelectedItems({
          type: SelectionActions.clear,
        });
        setEnableSelection(false);
        break;
    }
  };

  useEffect(() => {
    if (!isFocused) {
      console.log('[SelectionButtons.tsx] Focus has been lost, clearing selection.');
      dispatchSelectedItems({
        type: SelectionActions.clear,
      });
      setEnableSelection(false);
    }
  }, [dispatchSelectedItems, isFocused, setEnableSelection]);

  return (
    <View style={styles.container}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          icon={button.icon}
          mode={'text'}
          style={button.style}
          textColor={theme.colors.onBackground}
          onPress={() => onValueChange(button.value)}>
          {button.label}
        </Button>
      ))}
    </View>
  );
};
