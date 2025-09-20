import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {View, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
import React, {useEffect} from 'react';
import {SegmentedButtonType} from '../../../Libraries/Types/index.ts';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {useIsFocused} from '@react-navigation/native';
import {useAppTheme} from '../../../Styles/Theme.ts';
import {ForumListData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {ForumListDataSelectionActions} from '../../Reducers/Forum/ForumListDataSelectionReducer.ts';
import {useSelection} from '../../Context/Contexts/SelectionContext.ts';

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
