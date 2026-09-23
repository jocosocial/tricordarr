import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const FavoriteChatHelpTopicView = () => {
  return (
    <HelpTopicView title={'Favorite'} icon={AppIcons.favorite}>
      Favorite a conversation to flag it as one you intend to come back to. Favorites are yours alone; nobody else can
      see them, and you can filter any list down to just your favorites. A conversation cannot be both favorited and
      muted, so favoriting is unavailable while a conversation is muted. Leaving a conversation clears its favorite.
    </HelpTopicView>
  );
};
