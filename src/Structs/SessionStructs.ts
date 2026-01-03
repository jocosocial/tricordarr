import {TokenStringData} from '#src/Structs/ControllerStructs';

/**
 * Represents a user session with server configuration and authentication state.
 */
export interface Session {
  sessionID: string; // UUID
  serverUrl: string;
  preRegistrationMode: boolean;
  tokenData: TokenStringData | null;
  createdAt: string; // ISO date string
  lastUsedAt: string; // ISO date string
}
