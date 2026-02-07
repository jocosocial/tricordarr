import React from 'react';

import {SearchBarBase} from '#src/Components/Search/SearchBarBase';

interface KaraokeSearchBarProps {
  searchQuery: string;
  onChangeSearch?: (query: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
}

/**
 * Search bar for karaoke song library.
 * Backend allows: search ≥3 chars, or single letter, or #.
 * We use minLength 1 so single character and # are accepted; parent controls when to run the query.
 */
export const KaraokeSearchBar = ({searchQuery, onChangeSearch, onSearch, onClear}: KaraokeSearchBarProps) => {
  return (
    <SearchBarBase
      placeholder={'Search Song Library'}
      minLength={1}
      searchQuery={searchQuery}
      onChangeSearch={onChangeSearch}
      onSearch={onSearch}
      onClear={onClear}
      autoSearch={false}
    />
  );
};
