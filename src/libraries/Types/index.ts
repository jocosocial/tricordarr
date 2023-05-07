// https://www.reddit.com/r/typescript/comments/vdk8we/is_there_a_type_for_objects_with_arbitrary_keys/
export interface KvObject {
  [key: string]: string | null;
}

export type StringOrError = string | Error;
