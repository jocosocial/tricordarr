import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useForumCategoriesQuery} from '../../Queries/Forum/ForumCategoryQueries';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {Divider} from 'react-native-paper';
import {ListSection} from '../../Lists/ListSection';
import {ForumCategoryListItem} from '../../Lists/Items/ForumCategoryListItem';

export const ForumCategoriesScreen = () => {
  const {data, refetch, isLoading} = useForumCategoriesQuery();
  const {forumCategories, setForumCategories} = useTwitarr();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  useEffect(() => {
    if (data) {
      setForumCategories(data);
    }
  }, [data, setForumCategories]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh || isLoading} />}>
        <View>
          <ListSection>
            {forumCategories.map((category, index) => {
              return (
                <React.Fragment key={category.categoryID}>
                  {index === 0 && <Divider bold={true} />}
                  <ForumCategoryListItem category={category} />
                  <Divider bold={true} />
                </React.Fragment>
              );
            })}
          </ListSection>
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
