import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';

import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {ForumListDataSelectionActions} from '#src/Reducers/Forum/ForumListDataSelectionReducer';
import {ForumListData} from '#src/Structs/ControllerStructs';
import {useAppTheme} from '#src/Styles/Theme';
import {SegmentedButtonType} from '#src/Types';

interface SelectionButtonsProps {
  items?: ForumListData[];
}

export const SelectionButtons = ({items = []}: SelectionButtonsProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const isFocused = useIsFocused();
  const {dispatchSelectedForums, setEnableSelection, selectedForums} = useSelection();

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
        dispatchSelectedForums({
          type: ForumListDataSelectionActions.clear,
        });
        break;
      case 'all':
        dispatchSelectedForums({
          type: ForumListDataSelectionActions.set,
          items: items,
        });
        break;
      case 'inverse':
        const inverted = items.filter(
          allItem => !selectedForums.some(selectedItem => selectedItem.forumID === allItem.forumID),
        );
        dispatchSelectedForums({
          type: ForumListDataSelectionActions.set,
          items: inverted,
        });
        break;
      case 'cancel':
        dispatchSelectedForums({
          type: ForumListDataSelectionActions.clear,
        });
        setEnableSelection(false);
        break;
    }
  };

  useEffect(() => {
    if (!isFocused) {
      console.log('[SelectionButtons.tsx] Focus has been lost, clearing selection.');
      dispatchSelectedForums({
        type: ForumListDataSelectionActions.clear,
      });
      setEnableSelection(false);
    }
  }, [dispatchSelectedForums, isFocused, setEnableSelection]);

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
