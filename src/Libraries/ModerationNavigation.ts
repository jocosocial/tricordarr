import {StackNavigationProp} from '@react-navigation/stack';

import {ReportType} from '#src/Enums/ReportType';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';

/**
 * Opens the native moderation screen for a piece of content.
 * Twarrts and Quartermaster are not implemented in the app, so they fall back to the site UI.
 */
export const pushModerateScreen = (
  navigation: StackNavigationProp<CommonStackParamList>,
  type: ReportType,
  id: string,
): void => {
  switch (type) {
    case ReportType.twarrt:
      navigation.push(CommonStackComponents.siteUIScreen, {
        resource: 'twarrt',
        id,
        moderate: true,
      });
      return;
    case ReportType.forumPost:
      navigation.push(CommonStackComponents.moderateForumPostScreen, {id});
      return;
    case ReportType.forum:
      navigation.push(CommonStackComponents.moderateForumThreadScreen, {id});
      return;
    case ReportType.fez:
      navigation.push(CommonStackComponents.moderateFezScreen, {id});
      return;
    case ReportType.fezPost:
      navigation.push(CommonStackComponents.moderateFezPostScreen, {id});
      return;
    case ReportType.userProfile:
      navigation.push(CommonStackComponents.moderateProfileScreen, {id});
      return;
    case ReportType.mkSong:
    case ReportType.mkSongSnippet:
      navigation.push(CommonStackComponents.moderateMicroKaraokeSongScreen, {id});
      return;
    case ReportType.streamPhoto:
      navigation.push(CommonStackComponents.moderatePhotostreamScreen, {id});
      return;
    case ReportType.privateEvent:
      navigation.push(CommonStackComponents.moderatePrivateEventScreen, {id});
      return;
    case ReportType.quartermasterItem:
      navigation.push(CommonStackComponents.siteUIScreen, {
        resource: 'quartermaster',
        id,
        moderate: true,
      });
      return;
  }
};

/**
 * Resource names previously used by ModerateMenuItem / site UI moderate URLs.
 */
export type ModerateResource =
  'forum' | 'forumpost' | 'photostream' | 'lfg' | 'fezpost' | 'userprofile' | 'user' | 'personalevent' | 'twarrt';

/**
 * Maps site-UI moderate resource names to native screens.
 */
export const pushModerateResource = (
  navigation: StackNavigationProp<CommonStackParamList>,
  resource: ModerateResource,
  id: string,
): void => {
  switch (resource) {
    case 'forum':
      pushModerateScreen(navigation, ReportType.forum, id);
      return;
    case 'forumpost':
      pushModerateScreen(navigation, ReportType.forumPost, id);
      return;
    case 'photostream':
      pushModerateScreen(navigation, ReportType.streamPhoto, id);
      return;
    case 'lfg':
      pushModerateScreen(navigation, ReportType.fez, id);
      return;
    case 'fezpost':
      pushModerateScreen(navigation, ReportType.fezPost, id);
      return;
    case 'userprofile':
      pushModerateScreen(navigation, ReportType.userProfile, id);
      return;
    case 'user':
      navigation.push(CommonStackComponents.moderateUserScreen, {id});
      return;
    case 'personalevent':
      pushModerateScreen(navigation, ReportType.privateEvent, id);
      return;
    case 'twarrt':
      pushModerateScreen(navigation, ReportType.twarrt, id);
      return;
  }
};
