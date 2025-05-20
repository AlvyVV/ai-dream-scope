// Test Redis connection
import dotenv from 'dotenv';
import { createClient } from 'redis';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function main() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error('REDIS_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to Redis...');
  const client = createClient({
    url: redisUrl,
  });

  client.on('error', err => {
    console.error('Redis Client Error:', err);
    process.exit(1);
  });

  try {
    await client.connect();
    console.log('Successfully connected to Redis!');

    // Test basic operations
    await client.set('test-key', 'Hello from Redis test script');
    const value = await client.get('test-key');
    console.log('Retrieved test value:', value);

    // Clean up
    await client.del('test-key');
    console.log('Test key deleted');

    await client.disconnect();
    console.log('Disconnected from Redis');
  } catch (error) {
    console.error('Error during Redis operations:', error);
    process.exit(1);
  }
}

main();
