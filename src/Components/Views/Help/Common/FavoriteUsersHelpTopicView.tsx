import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

interface FavoriteUsersHelpTopicViewProps {
  forListScreen?: boolean;
}

export const FavoriteUsersHelpTopicView = ({forListScreen = true}: FavoriteUsersHelpTopicViewProps = {}) => {
  return (
    <HelpTopicView title={forListScreen ? 'Favorite Users' : 'Favorite User'} icon={AppIcons.userFavorite}>
      {forListScreen && 'View and manage your list of favorite users. '}
      Favoriting a user allows them to call you with KrakenTalk™.
    </HelpTopicView>
  );
};
