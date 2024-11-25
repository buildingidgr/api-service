// ... (previous code remains the same)

async checkHealth(): Promise<boolean> {
  if (!this.connection || !this.channel) {
    return false;
  }

  try {
    await this.channel.checkQueue('webhook-events');
    return true;
  } catch (error) {
    logger.error('RabbitMQ health check failed:', error);
    return false;
  }
}

// ... (rest of the file remains the same)

