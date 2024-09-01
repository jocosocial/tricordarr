import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {View, StyleSheet} from 'react-native';
import {SegmentedButtons} from 'react-native-paper';
import React, {Dispatch, SetStateAction, useEffect} from 'react';
import {FloatingButtonDisplayPosition, SegmentedButtonType} from '../../../libraries/Types';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {useIsFocused} from '@react-navigation/native';

interface FloatingSelectionButtonsProps<TItem> {
  displayPosition?: FloatingButtonDisplayPosition;
  items?: TItem[];
  keyExtractor: (item: TItem) => string;
  selectedItems?: TItem[];
  setSelectedItems: Dispatch<SetStateAction<TItem[]>>;
  setEnableSelection: Dispatch<SetStateAction<boolean>>;
}

export const FloatingSelectionButtons = <TItem extends object>({
  displayPosition = 'bottom',
  items = [],
  keyExtractor,
  selectedItems = [],
  setSelectedItems,
  setEnableSelection,
}: FloatingSelectionButtonsProps<TItem>) => {
  const {commonStyles} = useStyles();
  const isFocused = useIsFocused();

  const styles = StyleSheet.create({
    outerContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
      ...commonStyles.fullWidth,
      ...commonStyles.backgroundTransparent,
      ...commonStyles.positionAbsolute,
      ...(displayPosition === 'bottom' ? {bottom: 100} : undefined),
      ...(displayPosition === 'raised' ? {bottom: 80} : undefined),
    },
    innerContainer: {
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingHorizontalLarge,
      flex: 1,
    },
    button: {
      ...commonStyles.surfaceVariant,
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
      console.log('[FloatingSelectionButtons.tsx] Focus has been lost, clearing selection.');
      setSelectedItems([]);
      setEnableSelection(false);
    }
  }, [isFocused, setEnableSelection, setSelectedItems]);

  return (
    <View style={styles.outerContainer} pointerEvents={'box-none'}>
      <View style={styles.innerContainer}>
        <SegmentedButtons buttons={buttons} value={''} onValueChange={onValueChange} />
      </View>
    </View>
  );
};
