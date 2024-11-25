import amqp from 'amqplib';
import { config } from '../config';
import { createLogger } from './logger';

const logger = createLogger('rabbitmq');

class RabbitMQConnection {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmqUrl!, {
        heartbeat: 60, // Send a heartbeat every 60 seconds
      });
      this.channel = await this.connection.createChannel();
      logger.info('Connected to RabbitMQ');

      this.connection.on('error', (err) => {
        logger.error('RabbitMQ connection error:', err);
        this.reconnect();
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        this.reconnect();
      });

    } catch (error) {
      logger.error('Error connecting to RabbitMQ:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      logger.info('Attempting to reconnect to RabbitMQ...');
      this.connect();
    }, 5000); // Wait 5 seconds before attempting to reconnect
  }

  async consumeMessages(queue: string, callback: (message: any) => Promise<void>) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content);
            this.channel?.ack(msg);
          } catch (error) {
            logger.error(`Error processing message from queue ${queue}:`, error);
            // Nack the message and requeue it
            this.channel?.nack(msg, false, true);
          }
        }
      });
      logger.info(`Consuming messages from queue: ${queue}`);
    } catch (error) {
      logger.error(`Error consuming messages from queue ${queue}:`, error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      await this.channel?.close();
      await this.connection?.close();
      logger.info('Closed RabbitMQ connection');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
    }
  }
}

export const rabbitmq = new RabbitMQConnection();

