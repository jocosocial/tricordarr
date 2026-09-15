import {createContext, useContext} from 'react';

import {UserAccessLevel} from '#src/Enums/UserAccessLevel';

export const DEFAULT_MAX_FORUM_POST_IMAGES = 4;
export const SHUTTERNAUT_MAX_FORUM_POST_IMAGES = 8;
export const DEFAULT_MAX_IMAGE_SIZE = 20 * 1024 * 1024;
export const DEFAULT_PHOTOSTREAM_UPLOAD_RATE_LIMIT = 300;

interface ClientSettingsContextType {
  updateClientSettings: () => Promise<void>;
  /** Maximum number of images allowed on a forum post. Shutternauts get 8; everyone else uses server settings (default 4). */
  maxForumPostImages: number;
  /** Maximum size of a single uploaded image, in bytes. Falls back to 20 MiB. */
  maxImageSize: number;
  /** Minimum seconds between photostream uploads. 0 disables the cooldown. Falls back to 300. */
  photostreamUploadRateLimit: number;
  /** TRUE if the server currently requires a minimum access level to log in (and pre-registration is not enabled). */
  isAccessRestricted: boolean;
  /** The minimum access level required to use the full server. Only meaningful when isAccessRestricted is TRUE. */
  minAccessLevel: UserAccessLevel;
}

export const ClientSettingsContext = createContext<ClientSettingsContextType>({
  updateClientSettings: async () => {},
  maxForumPostImages: DEFAULT_MAX_FORUM_POST_IMAGES,
  maxImageSize: DEFAULT_MAX_IMAGE_SIZE,
  photostreamUploadRateLimit: DEFAULT_PHOTOSTREAM_UPLOAD_RATE_LIMIT,
  isAccessRestricted: false,
  minAccessLevel: UserAccessLevel.banned,
});

export const useClientSettings = () => useContext(ClientSettingsContext);
