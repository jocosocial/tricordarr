import React, {useCallback} from 'react';
import {Divider} from 'react-native-paper';

import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';
import {NoResultsFooter} from '#src/Components/Lists/Footers/NoResultsFooter';
import {LoadingPreviousHeader} from '#src/Components/Lists/Headers/LoadingPreviousHeader';

interface UseAppFlashListProps<TItem> {
  data: TItem[];
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

interface UseAppFlashListReturn {
  getListSeparator: () => React.JSX.Element;
  getListHeader: () => React.JSX.Element;
  getListFooter: () => React.JSX.Element;
}

/**
 * Shared AppFlashList chrome for lists of discrete items.
 *
 * Renders a bold Divider as the list header and item separator when `data`
 * is non-empty, EndResultsFooter when there are results, and NoResultsFooter
 * when the list is empty. When `hasPreviousPage` / `hasNextPage` are set,
 * the header and footer show loading chrome instead.
 *
 * @param props - List `data` plus optional pagination flags.
 * @returns Header, separator, and footer render callbacks for AppFlashList.
 */
export const useAppFlashList = <TItem,>({
  data,
  hasNextPage,
  hasPreviousPage,
}: UseAppFlashListProps<TItem>): UseAppFlashListReturn => {
  const hasItems = data.length > 0;

  /**
   * Bold Divider between items when the list is non-empty; otherwise an empty fragment.
   */
  const getListSeparator = useCallback(() => {
    if (hasItems) {
      return <Divider bold={true} />;
    }
    return <></>;
  }, [hasItems]);

  /**
   * LoadingPreviousHeader when a previous page exists; otherwise a bold Divider
   * when the list is non-empty, or an empty fragment.
   */
  const getListHeader = useCallback(() => {
    if (hasPreviousPage) {
      return <LoadingPreviousHeader />;
    }
    if (hasItems) {
      return <Divider bold={true} />;
    }
    return <></>;
  }, [hasItems, hasPreviousPage]);

  /**
   * LoadingNextFooter when a next page exists; otherwise EndResultsFooter when
   * the list is non-empty, or NoResultsFooter.
   */
  const getListFooter = useCallback(() => {
    if (hasNextPage) {
      return <LoadingNextFooter />;
    }
    if (hasItems) {
      return <EndResultsFooter />;
    }
    return <NoResultsFooter />;
  }, [hasItems, hasNextPage]);

  return {
    getListSeparator,
    getListHeader,
    getListFooter,
  };
};
