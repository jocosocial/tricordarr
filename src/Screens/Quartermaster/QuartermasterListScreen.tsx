import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {QuartermasterFAB} from '#src/Components/Buttons/FloatingActionButtons/QuartermasterFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {QuartermasterCategoryButtons} from '#src/Components/Buttons/SegmentedButtons/QuartermasterCategoryButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {QuartermasterFlashList} from '#src/Components/Lists/Quartermaster/QuartermasterFlashList';
import {QuartermasterListActionsMenu} from '#src/Components/Menus/Quartermaster/QuartermasterListActionsMenu';
import {QuartermasterListFilterMenu} from '#src/Components/Menus/Quartermaster/QuartermasterListFilterMenu';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {AppView} from '#src/Components/Views/AppView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useQuartermasterFilter} from '#src/Context/Contexts/QuartermasterFilterContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {getQuartermasterLinkParams} from '#src/Libraries/Quartermaster/QuartermasterLinks';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {useQuartermasterListQuery} from '#src/Queries/Quartermaster/QuartermasterQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {QuartermasterData} from '#src/Structs/ControllerStructs';

export type Props = StackScreenProps<MainStackParamList, MainStackComponents.quartermasterListScreen>;

/**
 * Quartermastarr have/need board. Checkpoints wrap the inner screen in the standard order.
 */
export const QuartermasterListScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.quartermasterHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.quartermaster} urlPath={'/quartermaster'}>
          <QuartermasterListScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

/**
 * Have/Need chips, inline search, and the item list. Category, Mine, and the submitted search
 * live in `QuartermasterFilterContext`; the search text itself is local until submitted.
 */
const QuartermasterListScreenInner = ({navigation, route}: Props) => {
  const {hasVerified} = usePrivilege();
  const {commonStyles} = useStyles();
  // Not PaddedContentView: it sets flex: 1, which outside a scroll view would split the screen
  // with the list instead of hugging the toggle.
  const styles = useMemo(
    () =>
      StyleSheet.create({
        toggle: {
          ...commonStyles.paddingTopSmall,
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingBottomSmall,
        },
      }),
    [commonStyles],
  );
  const {
    quartermasterCategory,
    setQuartermasterCategory,
    quartermasterMine,
    setQuartermasterMine,
    quartermasterSearch,
    setQuartermasterSearch,
  } = useQuartermasterFilter();
  // The text field is local so that typing doesn't fire a request per keystroke; it is only
  // committed to the filter (and so to the query) when the user submits a valid search.
  const [searchInput, setSearchInput] = useState(quartermasterSearch);
  const listRef = useRef<FlashListRef<QuartermasterData>>(null);
  const {category: routeCategory, mine: routeMine, scrollToTopIntent} = route.params ?? {};

  const {data, refetch, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} = useQuartermasterListQuery({
    category: quartermasterCategory,
    mine: quartermasterMine,
    search: quartermasterSearch,
  });
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const {handleLoadNext} = usePagination({fetchNextPage, hasNextPage, isFetchingNextPage});

  const items = useMemo(() => data?.pages.flatMap(p => p.items) ?? [], [data]);

  const onReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const getNavButtons = useCallback(
    () => (
      <View>
        <MaterialHeaderButtons>
          <QuartermasterListFilterMenu />
          <QuartermasterListActionsMenu onReload={onReload} />
        </MaterialHeaderButtons>
      </View>
    ),
    [onReload],
  );

  useEffect(() => {
    navigation.setOptions({headerRight: getNavButtons});
  }, [navigation, getNavButtons]);

  // Links can ask for a category or "mine" view: by path (the website's /need and /owned pages,
  // which aliases can't give params) or by query param. Explicit params win over the path.
  const linkedPath = route.path;
  useEffect(() => {
    const linked = {...getQuartermasterLinkParams(linkedPath)};
    const category = routeCategory ?? linked.category;
    const mine = routeMine ?? linked.mine;
    if (category) {
      setQuartermasterCategory(category);
    }
    if (mine !== undefined) {
      setQuartermasterMine(mine);
    }
  }, [linkedPath, routeCategory, routeMine, setQuartermasterCategory, setQuartermasterMine]);

  useEffect(() => {
    if (scrollToTopIntent) {
      listRef.current?.scrollToOffset({offset: 0, animated: false});
    }
  }, [scrollToTopIntent]);

  // Switching category or Mine swaps the whole result set, so start from the top.
  useEffect(() => {
    listRef.current?.scrollToOffset({offset: 0, animated: false});
  }, [quartermasterCategory, quartermasterMine, quartermasterSearch]);

  const onSearch = useCallback(() => {
    setQuartermasterSearch(searchInput.trim());
  }, [searchInput, setQuartermasterSearch]);

  const onClearSearch = useCallback(() => {
    setSearchInput('');
    setQuartermasterSearch('');
  }, [setQuartermasterSearch]);

  // The chips and search bar live above the list, not in its header: a header component that
  // changes with every keystroke would remount and steal focus from the text input. They also
  // stay mounted while a new category or search is loading.
  return (
    <AppView>
      <View style={styles.toggle}>
        <QuartermasterCategoryButtons category={quartermasterCategory} setCategory={setQuartermasterCategory} />
      </View>
      <SearchBarBase
        testID={'quartermasterSearch-input'}
        placeholder={`Search ${QuartermasterCategory.getLabel(quartermasterCategory)} items`}
        searchQuery={searchInput}
        onChangeSearch={setSearchInput}
        onSearch={onSearch}
        onClear={onClearSearch}
      />
      <View style={commonStyles.flex}>
        {isLoading ? (
          <LoadingView />
        ) : (
          <QuartermasterFlashList
            ref={listRef}
            items={items}
            handleLoadNext={handleLoadNext}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            scrollButtonRaised={hasVerified}
          />
        )}
      </View>
      {hasVerified && <QuartermasterFAB category={quartermasterCategory} />}
    </AppView>
  );
};
