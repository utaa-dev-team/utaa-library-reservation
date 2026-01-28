import Redis from 'ioredis';

// Eğer global bir redis instance yoksa yeni oluştur, varsa onu kullan (Development ortamında hot-reload sorununu önlemek için)
const getRedisClient = () => {
  if (!global.redisClient) {
    global.redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  }
  return global.redisClient;
};

const redis = getRedisClient();

export default redis;