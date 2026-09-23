import {type FlashListRef} from '@shopify/flash-list';
import React, {forwardRef, useCallback, useMemo} from 'react';
import {RefreshControlProps, StyleSheet, View} from 'react-native';

import {PerformerHeaderCard} from '#src/Components/Cards/Performer/PerformerHeaderCard';
import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {PerformerHeaderData} from '#src/Structs/ControllerStructs';

interface PerformerFlashListProps {
  items: PerformerHeaderData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  renderListHeader?: React.ComponentType<any>;
}

/**
 * Two-column grid of performer cards, shared by the performer list and search screens.
 */
const PerformerFlashListInner = (
  {items, refreshControl, handleLoadNext, renderListHeader}: PerformerFlashListProps,
  ref: React.ForwardedRef<FlashListRef<PerformerHeaderData>>,
) => {
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        cardContainer: {
          ...commonStyles.paddingSmall,
        },
      }),
    [commonStyles.paddingSmall],
  );

  const renderItem = useCallback(
    ({item, index}: {item: PerformerHeaderData; index: number}) => {
      return (
        <View key={`performer-${item.name}-${index}`} style={styles.cardContainer}>
          <PerformerHeaderCard header={item} />
        </View>
      );
    },
    [styles.cardContainer],
  );

  /**
   * Bottom spacer so the last row of cards can scroll fully into view.
   */
  const renderListFooter = useCallback(() => {
    return <View style={commonStyles.overscroll} />;
  }, [commonStyles.overscroll]);

  const keyExtractor = useCallback((item: PerformerHeaderData, index: number) => {
    return item.id || `performer-${item.name}-${index}`;
  }, []);

  return (
    <AppFlashList<PerformerHeaderData>
      ref={ref}
      renderItem={renderItem}
      data={items}
      keyExtractor={keyExtractor}
      handleLoadNext={handleLoadNext}
      refreshControl={refreshControl}
      renderListHeader={renderListHeader}
      renderListFooter={renderListFooter}
      numColumns={2}
    />
  );
};

export const PerformerFlashList = forwardRef(PerformerFlashListInner) as (
  props: PerformerFlashListProps & {ref?: React.ForwardedRef<FlashListRef<PerformerHeaderData>>},
) => ReturnType<typeof PerformerFlashListInner>;
