import { createLogger } from '../utils/logger';
import { ProfileService } from './ProfileService';

const logger = createLogger('WebhookService');
const profileService = new ProfileService();

export class WebhookService {
  async processWebhookEvent(event: any) {
    logger.info(`Processing webhook event: ${event.type}`, { eventData: JSON.stringify(event) });

    switch (event.type) {
      case 'user.created':
        await this.handleUserCreated(event.data);
        break;
      case 'user.updated':
        await this.handleUserUpdated(event.data);
        break;
      case 'api_key.created':
        await this.handleApiKeyCreated(event.data);
        break;
      default:
        logger.warn(`Unhandled webhook event type: ${event.type}`);
    }
  }

  private async handleUserCreated(userData: any) {
    try {
      logger.info('Handling user.created event', { userId: userData.id });
      const newProfile = await profileService.createProfile({
        id: userData.id,
        email: userData.email_addresses[0]?.email_address,
        emailVerified: userData.email_addresses[0]?.verification?.status === 'verified',
        phoneNumber: userData.phone_numbers[0]?.phone_number,
        phoneVerified: userData.phone_numbers[0]?.verification?.status === 'verified',
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatarUrl: userData.image_url,
        externalAccounts: userData.oauth_accounts?.map((account: any) => ({
          provider: account.provider,
          providerId: account.provider_user_id
        })),
        preferences: {}
      });
      logger.info(`Created new profile for user: ${newProfile.id}`);
    } catch (error) {
      logger.error('Error handling user.created event:', error);
      throw error;
    }
  }

  private async handleUserUpdated(userData: any) {
    try {
      logger.info('Handling user.updated event', { userId: userData.id });
      const updatedProfile = await profileService.updateProfile(userData.id, {
        email: userData.email_addresses[0]?.email_address,
        emailVerified: userData.email_addresses[0]?.verification?.status === 'verified',
        phoneNumber: userData.phone_numbers[0]?.phone_number,
        phoneVerified: userData.phone_numbers[0]?.verification?.status === 'verified',
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatarUrl: userData.image_url,
        externalAccounts: userData.oauth_accounts?.map((account: any) => ({
          provider: account.provider,
          providerId: account.provider_user_id
        }))
      });
      logger.info(`Updated profile for user: ${updatedProfile.id}`);
    } catch (error) {
      logger.error('Error handling user.updated event:', error);
      throw error;
    }
  }

  private async handleApiKeyCreated(apiKeyData: any) {
    try {
      logger.info('Handling api_key.created event', { userId: apiKeyData.userId });
      await profileService.storeApiKey(apiKeyData.userId, apiKeyData.apiKey);
      logger.info(`Stored API Key for user: ${apiKeyData.userId}`);
    } catch (error) {
      logger.error('Error handling api_key.created event:', error);
      throw error;
    }
  }
}

