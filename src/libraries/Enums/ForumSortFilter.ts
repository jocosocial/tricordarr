// https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Site/SiteForumController.swift
import {ForumRelationQueryType} from '../../components/Queries/Forum/ForumRelationQueries';

export enum ForumSortOrder {
  event = 'event',
  update = 'update',
  create = 'create',
  title = 'title',
}

export enum ForumFilter {
  owned = 'owned',
  favorite = 'favorite',
  mute = 'mute',
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
    }
  };
}
