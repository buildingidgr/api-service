import axios from 'axios';
import { config } from '../config';

export class AuthService {
  private static instance: AuthService;
  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async exchangeToken(apiKey: string): Promise<string> {
    try {
      const response = await axios.post(`${config.authServiceUrl}/v1/token/exchange`, { apiKey });
      return response.data.access_token;
    } catch (error) {
      console.error('Error exchanging token:', error);
      throw new Error('Failed to exchange token');
    }
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const response = await axios.post(`${config.authServiceUrl}/v1/token/refresh`, { refresh_token: refreshToken });
      return response.data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh token');
    }
  }
}

