import {compareVersions} from 'compare-versions';
import {useMemo} from 'react';

import {useClientConfigQuery} from '#src/Queries/Client/ClientQueries';
import {SwiftarrClientConfig} from '#src/Structs/ControllerStructs';

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isComparableVersion = (value: unknown): value is string => {
  if (typeof value !== 'string' || !value.trim()) {
    return false;
  }

  try {
    compareVersions(value, value);
    return true;
  } catch {
    return false;
  }
};

const parseClientConfig = (value: unknown): SwiftarrClientConfig | undefined => {
  if (!isObject(value) || !isObject(value.metadata) || !isObject(value.spec)) {
    return undefined;
  }

  const {apiVersion, kind, metadata, spec} = value;

  if (
    typeof apiVersion !== 'string' ||
    typeof kind !== 'string' ||
    typeof metadata.name !== 'string' ||
    !isComparableVersion(spec.latestVersion)
  ) {
    return undefined;
  }

  return {
    apiVersion,
    kind,
    metadata: {
      name: metadata.name,
    },
    spec: {
      latestVersion: spec.latestVersion,
    },
  };
};

export const useClientConfig = (options = {}) => {
  const query = useClientConfigQuery(options);
  const data = useMemo(() => parseClientConfig(query.data), [query.data]);

  return {
    ...query,
    data,
  };
};
