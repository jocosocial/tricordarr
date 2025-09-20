import {HelperText, Searchbar} from 'react-native-paper';
import React, {useEffect} from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {StyleSheet, ViewStyle} from 'react-native';

interface SearchBarBaseProps {
  onSearch?: () => void;
  onChangeSearch?: (query: string) => void;
  searchQuery: string;
  onClear?: () => void;
  placeholder?: string;
  minLength?: number;
  style?: ViewStyle;
  remove?: () => void;
}

export const SearchBarBase = ({
  onSearch,
  onChangeSearch,
  searchQuery,
  onClear,
  placeholder = 'Search',
  minLength = 3,
  style,
  remove,
}: SearchBarBaseProps) => {
  const {commonStyles} = useStyles();
  const [showHelp, setShowHelp] = React.useState(false);

  const styles = StyleSheet.create({
    searchBar: {
      ...commonStyles.marginTop,
      ...commonStyles.marginHorizontal,
      ...style,
    },
  });

  const onIconPress = () => {
    if (searchQuery.length < minLength) {
      setShowHelp(true);
    } else {
      setShowHelp(false);
      onSearch ? onSearch() : undefined;
    }
  };

  // Clear search results when you go back or otherwise unmount this screen.
  useEffect(() => {
    return () => (remove ? remove() : undefined);
  }, [remove]);

  return (
    <>
      <Searchbar
        placeholder={placeholder}
        onIconPress={onIconPress}
        onChangeText={onChangeSearch}
        value={searchQuery}
        onSubmitEditing={onSearch}
        onClearIconPress={onClear}
        style={styles.searchBar}
      />
      {showHelp && <HelperText type={'error'}>{`Must enter >${minLength - 1} characters to search`}</HelperText>}
    </>
  );
};
