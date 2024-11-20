import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps} from 'react-native';
import {SeamailListItem} from '../Items/SeamailListItem';
import React, {useCallback} from 'react';
import {Divider} from 'react-native-paper';
import {styleDefaults} from '../../../styles';

interface SeamailFlatListProps {
  fezList: FezData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onEndReached?: () => void;
  onScrollThreshold?: (condition: boolean) => void;
}

const ListSeparator = () => <Divider bold={true} />;

export const SeamailFlatList = (props: SeamailFlatListProps) => {
  const SeamailListMargin = useCallback(() => {
    if (props.fezList.length > 0) {
      return ListSeparator();
    }
    return null;
  }, [props.fezList]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (props.onScrollThreshold) {
      props.onScrollThreshold(event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold);
    }
  };

  return (
    <FlatList
      // With RN 0.72 if pageSize is too small this doesn't trigger onEndReached.
      // Page size bigger, just fine.
      // Encountered this with ForumPostFlatList and this time had a way around it.
      onLayout={props.onEndReached}
      refreshControl={props.refreshControl}
      ItemSeparatorComponent={ListSeparator}
      ListHeaderComponent={SeamailListMargin}
      ListFooterComponent={SeamailListMargin}
      onEndReached={props.onEndReached}
      keyExtractor={(item: FezData) => item.fezID}
      data={props.fezList}
      onScroll={handleScroll}
      renderItem={({item}) => <SeamailListItem fez={item} />}
      onEndReachedThreshold={5}
    />
  );
};
