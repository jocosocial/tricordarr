import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {View, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
import React, {useEffect} from 'react';
import {SegmentedButtonType} from '../../../libraries/Types';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {useIsFocused} from '@react-navigation/native';
import {useAppTheme} from '../../../styles/Theme.ts';
import {ForumListData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {ForumListDataSelectionActions} from '../../Reducers/Forum/ForumListDataSelectionReducer.ts';
import {useSelection} from '../../Context/Contexts/SelectionContext.ts';

interface SelectionButtonsProps {
  items?: ForumListData[];
}

export const SelectionButtons = ({items = []}: SelectionButtonsProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const isFocused = useIsFocused();
  const {setSelectedItems, setEnableSelection, selectedItems} = useSelection();

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
        // dispatchSelectedForums({
        //   type: ForumListDataSelectionActions.clear,
        // });
        setSelectedItems([]);
        break;
      case 'all':
        // dispatchSelectedForums({
        //   type: ForumListDataSelectionActions.set,
        //   items: items,
        // });
        setSelectedItems(items.map(i => i.forumID));
        break;
      case 'inverse':
        const inverted = items.filter(
          allItem => !selectedItems.some(selectedItem => selectedItem === allItem.forumID),
        );
        // dispatchSelectedForums({
        //   type: ForumListDataSelectionActions.set,
        //   items: inverted,
        // });
        setSelectedItems(inverted.map(i => i.forumID));
        break;
      case 'cancel':
        // dispatchSelectedForums({
        //   type: ForumListDataSelectionActions.clear,
        // });
        setSelectedItems([]);
        setEnableSelection(false);
        break;
    }
  };

  useEffect(() => {
    if (!isFocused) {
      console.log('[SelectionButtons.tsx] Focus has been lost, clearing selection.');
      // dispatchSelectedForums({
      //   type: ForumListDataSelectionActions.clear,
      // });
      setSelectedItems([]);
      setEnableSelection(false);
    }
  }, [setSelectedItems, isFocused, setEnableSelection]);

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
