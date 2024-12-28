import {Searchbar} from 'react-native-paper';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext.ts';
import {StyleSheet} from 'react-native';

interface SearchBarBaseProps {
  onSearch?: () => void;
  onChangeSearch?: (query: string) => void;
  searchQuery: string;
  onClear?: () => void;
  placeholder?: string;
}

export const SearchBarBase = ({
  onSearch,
  onChangeSearch,
  searchQuery,
  onClear,
  placeholder = 'Search',
}: SearchBarBaseProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    searchBar: {
      ...commonStyles.marginTop,
      ...commonStyles.marginHorizontal,
    },
  });

  return (
    <Searchbar
      placeholder={placeholder}
      onIconPress={onSearch}
      onChangeText={onChangeSearch}
      value={searchQuery}
      onSubmitEditing={onSearch}
      onClearIconPress={onClear}
      style={styles.searchBar}
    />
  );
};
