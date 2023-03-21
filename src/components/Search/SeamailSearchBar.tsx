import React from 'react';
import {Searchbar} from 'react-native-paper';
import {commonStyles} from '../../styles';

export const SeamailSearchBar = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const onChangeSearch = (query: string) => setSearchQuery(query);

  return (
    <Searchbar
      placeholder={'Search messages'}
      onChangeText={onChangeSearch}
      value={searchQuery}
      style={commonStyles.marginBottom}
    />
  );
};
