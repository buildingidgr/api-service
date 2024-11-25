import { createLogger } from '../utils/logger';
import { ProfileService } from './ProfileService';

const logger = createLogger('WebhookService');
const profileService = new ProfileService();

interface EmailAddress {
  id: string;
  email_address: string;
  verification: {
    status: string;
  };
}

interface PhoneNumber {
  id: string;
  phone_number: string;
  verification: {
    status: string;
  };
}

interface UserData {
  id: string;
  username: string | null;
  email_addresses: EmailAddress[];
  phone_numbers: PhoneNumber[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  primary_email_address_id: string | null;
  primary_phone_number_id: string | null;
  created_at: number;
  updated_at: number;
  banned: boolean;
  // Add other fields as needed
}

interface ApiKeyData {
  userId: string;
  apiKey: string;
}

type WebhookEvent = 
  | { type: 'user.created'; data: UserData }
  | { type: 'user.updated'; data: UserData }
  | { type: 'api_key.created'; data: ApiKeyData };

export class WebhookService {
  async processWebhookEvent(event: WebhookEvent) {
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
        logger.warn(`Unhandled webhook event type: ${(event as any).type}`);
    }
  }

  private async handleUserCreated(userData: UserData) {
    try {
      logger.info('Handling user.created event', { userId: userData.id });

      const primaryEmail = userData.email_addresses.find(email => email.id === userData.primary_email_address_id);
      const primaryPhone = userData.phone_numbers.find(phone => phone.id === userData.primary_phone_number_id);

      const newProfile = await profileService.createProfile({
        id: userData.id,
        email: primaryEmail?.email_address || null,
        emailVerified: primaryEmail?.verification?.status === 'verified' || false,
        phoneNumber: primaryPhone?.phone_number || null,
        phoneVerified: primaryPhone?.verification?.status === 'verified' || false,
        username: userData.username || undefined,
        firstName: userData.first_name || undefined,
        lastName: userData.last_name || undefined,
        avatarUrl: userData.image_url || undefined,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
        banned: userData.banned,
        preferences: {}
      });
      logger.info(`Created new profile for user: ${newProfile.id}`);
    } catch (error) {
      logger.error('Error handling user.created event:', error);
      throw error;
    }
  }

  private async handleUserUpdated(userData: UserData) {
    try {
      logger.info('Handling user.updated event', { userId: userData.id });

      const primaryEmail = userData.email_addresses.find(email => email.id === userData.primary_email_address_id);
      const primaryPhone = userData.phone_numbers.find(phone => phone.id === userData.primary_phone_number_id);

      const updatedProfile = await profileService.updateProfile(userData.id, {
        email: primaryEmail?.email_address || null,
        emailVerified: primaryEmail?.verification?.status === 'verified' || false,
        phoneNumber: primaryPhone?.phone_number || null,
        phoneVerified: primaryPhone?.verification?.status === 'verified' || false,
        username: userData.username || undefined,
        firstName: userData.first_name || undefined,
        lastName: userData.last_name || undefined,
        avatarUrl: userData.image_url || undefined,
        updatedAt: new Date(userData.updated_at),
        banned: userData.banned,
      });
      logger.info(`Updated profile for user: ${updatedProfile.id}`);
    } catch (error) {
      logger.error('Error handling user.updated event:', error);
      throw error;
    }
  }

  private async handleApiKeyCreated(apiKeyData: ApiKeyData) {
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

