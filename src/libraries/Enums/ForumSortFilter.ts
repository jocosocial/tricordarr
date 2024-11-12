// https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Site/SiteForumController.swift
import {ForumRelationQueryType} from '../../components/Queries/Forum/ForumThreadRelationQueries';

export enum ForumSort {
  event = 'event',
  update = 'update',
  create = 'create',
  title = 'title',
}

export namespace ForumSort {
  export const getLabel = (sort?: ForumSort) => {
    switch (sort) {
      case ForumSort.event:
        return 'Event Time';
      case ForumSort.update:
        return 'Most Recent Post';
      case ForumSort.create:
        return 'Creation Time';
      case ForumSort.title:
        return 'Title';
      default:
        return 'None';
    }
  };
}

export enum ForumSortDirection {
  ascending = 'ascending',
  descending = 'descending',
}

export namespace ForumSortDirection {
  export const getLabel = (direction?: ForumSortDirection) => {
    switch (direction) {
      case ForumSortDirection.ascending:
        return 'Ascending';
      case ForumSortDirection.descending:
        return 'Descending';
      default:
        return 'None';
    }
  };
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
