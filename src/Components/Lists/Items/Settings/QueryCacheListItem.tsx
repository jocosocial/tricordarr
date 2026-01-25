import {Query, QueryKey} from '@tanstack/react-query';
import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {List} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useClipboard} from '#src/Hooks/useClipboard';

interface QueryCacheListItemProps {
  query: Query;
  onPress: () => void;
}

interface ParsedQueryKey {
  endpoint: string | undefined;
  params: Record<string, unknown> | undefined;
  sessionId: string | undefined;
  serverUrl: string | undefined;
  userId: string | undefined;
}

/**
 * Parses a query key array into its components.
 * Query keys generally follow this pattern:
 * 0: endpoint
 * 1: query parameters object
 * 2: session ID
 * 3: Server URL
 * 4: User ID
 */
const parseQueryKey = (queryKey: QueryKey): ParsedQueryKey => {
  const keyArray = Array.isArray(queryKey) ? queryKey : [queryKey];
  return {
    endpoint: keyArray[0] as string | undefined,
    params: keyArray[1] as Record<string, unknown> | undefined,
    sessionId: keyArray[2] as string | undefined,
    serverUrl: keyArray[3] as string | undefined,
    userId: keyArray[4] as string | undefined,
  };
};

/**
 * Formats query parameters into a readable string.
 */
const formatParams = (params: Record<string, unknown> | undefined): string | undefined => {
  if (!params || Object.keys(params).length === 0) {
    return undefined;
  }

  return Object.entries(params)
    .map(([key, value]) => {
      if (value === undefined || value === null) {
        return null;
      }
      if (typeof value === 'object') {
        return `${key}: ${JSON.stringify(value)}`;
      }
      return `${key}: ${value}`;
    })
    .filter(Boolean)
    .join(', ');
};

/**
 * Builds a description string from the parsed query key components.
 */
const buildDescription = (parsed: ParsedQueryKey): string | undefined => {
  const parts: string[] = [];

  const formattedParams = formatParams(parsed.params);
  if (formattedParams) {
    parts.push(`Params: ${formattedParams}`);
  }

  if (parsed.sessionId) {
    parts.push(`SessionID: ${parsed.sessionId}`);
  }

  if (parsed.userId) {
    parts.push(`UserID: ${parsed.userId}`);
  }

  if (parsed.serverUrl) {
    parts.push(`ServerURL: ${parsed.serverUrl}`);
  }

  return parts.length > 0 ? parts.join('\n') : undefined;
};

export const QueryCacheListItem = ({query, onPress}: QueryCacheListItemProps) => {
  const {commonStyles} = useStyles();
  const {setString} = useClipboard();

  const parsed = useMemo(() => parseQueryKey(query.queryKey), [query.queryKey]);
  const description = useMemo(() => buildDescription(parsed), [parsed]);

  const styles = StyleSheet.create({
    title: {
      ...commonStyles.fontSizeDefault,
      ...commonStyles.onBackground,
      ...commonStyles.bold,
    },
    description: {
      ...commonStyles.fontSizeLabel,
      ...commonStyles.onBackground,
    },
    item: {
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.paddingVerticalZero,
    },
    content: {
      ...commonStyles.paddingLeftZero,
      ...commonStyles.paddingRightZero,
    },
  });

  const handleLongPress = () => {
    setString(query.queryKey.toString());
  };

  return (
    <List.Item
      title={parsed.endpoint || 'Unknown'}
      titleNumberOfLines={0}
      description={description}
      descriptionNumberOfLines={0}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      style={styles.item}
      contentStyle={styles.content}
      onPress={onPress}
      onLongPress={handleLongPress}
    />
  );
};
