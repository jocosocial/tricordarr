import {UserHeader} from './ControllerStructs';

export interface SocketFezPostData {
  /// PostID of the new post
  postID: number;
  /// User that posted. Should be a current member of the fez; socket should get a `SocketMemberChangeData` adding a new user before any posts by that user.
  /// But, there's a possible race condition where membership could change before the socket is opened. Unless you update FezData after opening the socket, you may
  /// see posts from users that don't appear to be members of the fez.
  author: UserHeader;
  /// The text of this post.
  text: string;
  /// When the post was made.
  timestamp: Date;
  /// An optional image that may be attached to the post.
  image?: string;
  /// HTML fragment for the post, using the Swiftarr Web UI's front end. Fragment is built using the same semantic data available in the other fields in this struct.
  /// Please don't try parsing this to gather data. This field is here so the Javascript can insert HTML that matches what the HTTP endpoints render.
  html?: string;
}

export interface SocketFezMemberChangeData {
  /// The user that joined/left.
  user: UserHeader;
  /// TRUE if this is a join.
  joined: boolean;
  /// HTML fragment for the action, using the Swiftarr Web UI's front end. Fragment is built using the same semantic data available in the other fields in this struct.
  /// Please don't try parsing this to gather data. This field is here so the Javascript can insert HTML that matches what the HTTP endpoints render.
  html?: string;
}
