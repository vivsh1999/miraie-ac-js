export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  userId: string;
  expiresIn: number;
}
