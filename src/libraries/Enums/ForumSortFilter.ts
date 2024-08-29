// https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Site/SiteForumController.swift
import {ForumRelationQueryType} from '../../components/Queries/Forum/ForumThreadRelationQueries';

export enum ForumSortOrder {
  event = 'event',
  update = 'update',
  create = 'create',
  title = 'title',
}

export enum ForumSortDirection {
  ascending = 'ascending',
  descending = 'descending',
}

export enum ForumFilter {
  owned = 'owned',
  favorite = 'favorite',
  mute = 'mute',
  unread = 'unread',
}

export namespace ForumFilter {
  export const toRelation = (f: ForumFilter) => {
    switch (f) {
      case ForumFilter.favorite:
        return ForumRelationQueryType.favorites;
      case ForumFilter.owned:
        return ForumRelationQueryType.owner;
      case ForumFilter.mute:
        return ForumRelationQueryType.mutes;
      case ForumFilter.unread:
        return ForumRelationQueryType.unread;
    }
  };
}
