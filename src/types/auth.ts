/**
 * Interface representing the authentication token received from the MirAIe API.
 */
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  userId: string;
  expiresIn: number;
}
