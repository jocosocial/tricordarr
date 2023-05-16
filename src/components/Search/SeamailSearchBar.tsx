import React, {useEffect} from 'react';
import {Searchbar} from 'react-native-paper';
import {useTwitarr} from '../Context/Contexts/TwitarrContext';

export const SeamailSearchBar = () => {
  const {searchString, setSearchString} = useTwitarr();
  const [localQuery, setLocalQuery] = React.useState(searchString);

  const onChangeSearch = (query: string) => setLocalQuery(query);
  const onExecuteSearch = () => setSearchString(localQuery);

  // This resets the global query string since onClearIconPress isnt a thing
  // for the Searchbar anymore.
  useEffect(() => {
    if (!localQuery) {
      setSearchString(localQuery);
    }
  }, [localQuery, setSearchString]);

  return (
    <Searchbar
      placeholder={'Search messages'}
      onChangeText={onChangeSearch}
      value={localQuery}
      onIconPress={onExecuteSearch}
    />
  );
};
