import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {View, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
import React, {Dispatch, SetStateAction, useEffect} from 'react';
import {SegmentedButtonType} from '../../../libraries/Types';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {useIsFocused} from '@react-navigation/native';
import {useAppTheme} from '../../../styles/Theme.ts';

interface SelectionButtonsProps<TItem> {
  items?: TItem[];
  keyExtractor: (item: TItem) => string;
  selectedItems?: TItem[];
  setSelectedItems: Dispatch<SetStateAction<TItem[]>>;
  setEnableSelection: Dispatch<SetStateAction<boolean>>;
}

export const SelectionButtons = <TItem extends object>({
  items = [],
  keyExtractor,
  selectedItems = [],
  setSelectedItems,
  setEnableSelection,
}: SelectionButtonsProps<TItem>) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const isFocused = useIsFocused();

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
        setSelectedItems([]);
        break;
      case 'all':
        setSelectedItems(items);
        break;
      case 'inverse':
        setSelectedItems(
          items.filter(
            allItem => !selectedItems.some(selectedItem => keyExtractor(selectedItem) === keyExtractor(allItem)),
          ),
        );
        break;
      case 'cancel':
        setSelectedItems([]);
        setEnableSelection(false);
        break;
    }
  };

  useEffect(() => {
    if (!isFocused) {
      console.log('[SelectionButtons.tsx] Focus has been lost, clearing selection.');
      setSelectedItems([]);
      setEnableSelection(false);
    }
  }, [isFocused, setEnableSelection, setSelectedItems]);

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
