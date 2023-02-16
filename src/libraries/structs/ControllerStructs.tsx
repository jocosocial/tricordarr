/**
 * Used to return a token string for use in HTTP Bearer Authentication.
 */
export class TokenStringData {
  userID: string;
  accessLevel: string;
  token: string;

  constructor(userID: string, accessLevel: string, token: string) {
    this.userID = userID;
    this.accessLevel = accessLevel;
    this.token = token;
  }
}
