import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const FavoriteUsersHelpTopicView = () => {
  return (
    <HelpTopicView title={'Favorite Users'} icon={AppIcons.userFavorite}>
      View and manage your list of favorite users. Favoriting a user allows them to call you with KrakenTalk™.
    </HelpTopicView>
  );
};
