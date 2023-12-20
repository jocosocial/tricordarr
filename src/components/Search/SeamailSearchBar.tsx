import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {Searchbar, Text} from 'react-native-paper';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useStyles} from '../Context/Contexts/StyleContext';
import {FezData} from '../../libraries/Structs/ControllerStructs';
import {useSeamailListQuery} from '../Queries/Fez/FezQueries';
import {View} from 'react-native';
import {ListSection} from '../Lists/ListSection';
import {SeamailListItem} from '../Lists/Items/SeamailListItem';

interface SeamailSearchBarProps {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export const SeamailSearchBar = ({setIsLoading}: SeamailSearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const {setErrorMessage} = useErrorHandler();
  const {data, refetch, isFetching, isFetched} = useSeamailListQuery({
    search: searchQuery,
    options: {
      enabled: false,
    },
  });
  const {commonStyles} = useStyles();
  const [fezList, setFezList] = useState<FezData[]>([]);

  console.log(searchQuery, data);

  const onChangeSearch = (query: string) => setSearchQuery(query);
  const onClear = () => setFezList([]);
  const onSearch = () => {
    if (!searchQuery || searchQuery.length < 3) {
      setErrorMessage('Search string must be >2 characters');
    } else {
      refetch();
    }
  };

  useEffect(() => {
    if (data) {
      let fezDataList: FezData[] = [];
      data.pages.map(page => {
        fezDataList = fezDataList.concat(page.fezzes);
      });
      setFezList(fezDataList);
    }
  }, [data]);

  useEffect(() => {
    setIsLoading(isFetching);
  }, [isFetching, setIsLoading]);

  return (
    <View>
      <Searchbar
        placeholder={'Search seamail messages'}
        onIconPress={onSearch}
        onChangeText={onChangeSearch}
        value={searchQuery}
        onSubmitEditing={onSearch}
        onClearIconPress={onClear}
        style={[commonStyles.marginBottomSmall, commonStyles.marginHorizontal]}
      />
      <ListSection>
        {isFetched && fezList.length === 0 && (
          <View key={'noResults'} style={[commonStyles.paddingVerticalSmall]}>
            <Text>No Results</Text>
          </View>
        )}
        {fezList.map((item, i) => (
          <View key={i} style={[commonStyles.paddingVerticalSmall]}>
            <SeamailListItem fez={item} />
          </View>
        ))}
      </ListSection>
    </View>
  );
};
