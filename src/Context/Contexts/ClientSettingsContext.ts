import {createContext, useContext} from 'react';

export const DEFAULT_MAX_FORUM_POST_IMAGES = 4;
export const SHUTTERNAUT_MAX_FORUM_POST_IMAGES = 8;
export const DEFAULT_MAX_IMAGE_SIZE = 20 * 1024 * 1024;
export const DEFAULT_PHOTOSTREAM_UPLOAD_RATE_LIMIT = 300;

interface ClientSettingsContextType {
  updateClientSettings: () => Promise<void>;
  /** Maximum number of images allowed on a forum post or private/personal event. Shutternauts get 8; everyone else uses server settings (default 4). */
  maxForumPostImages: number;
  /** Maximum size of a single uploaded image, in bytes. Falls back to 20 MiB. */
  maxImageSize: number;
  /** Minimum seconds between photostream uploads. 0 disables the cooldown. Falls back to 300. */
  photostreamUploadRateLimit: number;
}

export const ClientSettingsContext = createContext<ClientSettingsContextType>({
  updateClientSettings: async () => {},
  maxForumPostImages: DEFAULT_MAX_FORUM_POST_IMAGES,
  maxImageSize: DEFAULT_MAX_IMAGE_SIZE,
  photostreamUploadRateLimit: DEFAULT_PHOTOSTREAM_UPLOAD_RATE_LIMIT,
});

export const useClientSettings = () => useContext(ClientSettingsContext);
