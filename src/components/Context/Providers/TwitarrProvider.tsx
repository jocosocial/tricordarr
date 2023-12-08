import React, {useState, PropsWithChildren} from 'react';
import {FezData, ForumData} from '../../../libraries/Structs/ControllerStructs';
import {TwitarrContext} from '../Contexts/TwitarrContext';
import {useFezListReducer} from '../../Reducers/Fez/FezListReducers';
import {useFezPostsReducer} from '../../Reducers/Fez/FezPostsReducers';
import {useEventListReducer} from '../../Reducers/Schedule/EventListReducer';
import {useScheduleListReducer} from '../../Reducers/Schedule/ScheduleListReducer';
import {useConfig} from '../Contexts/ConfigContext';
import {Linking} from 'react-native';
import {useForumListDataReducer} from '../../Reducers/Forum/ForumListDataReducer';
import {useForumPostListReducer} from '../../Reducers/Forum/ForumPostListReducer';

export const TwitarrProvider = ({children}: PropsWithChildren) => {
  const [fez, setFez] = useState<FezData>();
  const [fezList, dispatchFezList] = useFezListReducer([]);
  const [fezPostsData, dispatchFezPostsData] = useFezPostsReducer();
  const [searchString, setSearchString] = useState('');
  const [eventList, dispatchEventList] = useEventListReducer([]);
  const [scheduleList, dispatchScheduleList] = useScheduleListReducer([]);
  const [lfgList, dispatchLfgList] = useFezListReducer([]);
  const [lfg, setLfg] = useState<FezData>();
  const [lfgPostsData, dispatchLfgPostsData] = useFezPostsReducer();
  const {appConfig} = useConfig();
  const [forumData, setForumData] = useState<ForumData>();
  const [forumListData, dispatchForumListData] = useForumListDataReducer([]);
  const [forumPosts, dispatchForumPosts] = useForumPostListReducer([]);
  const [forumThreadPosts, dispatchForumThreadPosts] = useForumPostListReducer([]);

  /**
   * Open a Twitarr URL. This is would normally get covered by Android App Links
   * https://developer.android.com/training/app-links but verifying a non-public
   * server is a problem, and it's a lot of work. Plus I want to translate certain URLs
   * until we fix the upstream. So this exists.
   * @param url
   */
  const openWebUrl = (url: string) => {
    if (url.startsWith(appConfig.serverUrl)) {
      let appUrl = url.replace(appConfig.serverUrl, 'tricordarr:/');
      if (appUrl.includes('/fez')) {
        appUrl = appUrl.replace('/fez', '/lfg');
      }
      console.log('[TwitarrProvider.tsx] Opening reformed URL', appUrl);
      Linking.openURL(appUrl);
      return;
    }
    Linking.openURL(url);
  };

  return (
    <TwitarrContext.Provider
      value={{
        fez,
        setFez,
        fezList,
        dispatchFezList,
        fezPostsData,
        dispatchFezPostsData,
        searchString,
        setSearchString,
        eventList,
        dispatchEventList,
        scheduleList,
        dispatchScheduleList,
        lfgList,
        dispatchLfgList,
        lfg,
        setLfg,
        lfgPostsData,
        dispatchLfgPostsData,
        openWebUrl,
        forumData,
        setForumData,
        forumListData,
        dispatchForumListData,
        forumPosts,
        dispatchForumPosts,
        forumThreadPosts,
        dispatchForumThreadPosts,
      }}>
      {children}
    </TwitarrContext.Provider>
  );
};
